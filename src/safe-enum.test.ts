import { CreateSafeEnum, CreateSafeEnumFromArray } from "./safe-enum-factory"

import { describe, it, expect, afterAll, vi } from 'vitest'

// Mock console.error to avoid polluting test output
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { /* intentionally empty for test */ })



describe("SafeEnum", () => {
  // Define a test enum
  const TestEnumMap = {
    FOO: { value: 'foo' as const, index: 0 },
    BAR: { value: 'bar' as const, index: 1 },
    BAZ: { value: 'baz' as const, index: 2 }
  } as const

  const TestEnum = CreateSafeEnum(TestEnumMap)
  
  afterAll(() => {
    mockConsoleError.mockRestore()
  })
  
  // Helper function to test invalid assignments
  function expectError(callback: () => void): void {
    let errorThrown = false;
    try {
      callback()
    } catch { 
      errorThrown = true;
    }
    expect(errorThrown).toBe(true);
  }
  
  describe("Basic functionality", () => {
    it("should create enum with correct values", () => {
      expect(TestEnum.FOO).toEqual(
        expect.objectContaining({
          value: "foo",
          index: 0
        })
      )
      expect(TestEnum.BAR).toEqual(
        expect.objectContaining({
          value: "bar",
          index: 1
        })
      )
      expect(TestEnum.BAZ).toEqual(
        expect.objectContaining({
          value: "baz",
          index: 2
        })
      )
    })

    it("should make properties read-only", () => {
      // Check if properties are read-only
      const originalValue = TestEnum.FOO.value;
      
      // Attempt to modify read-only property
      expectError(() => {
        // @ts-expect-error - Testing read-only property
        TestEnum.FOO.value = "new value";
      });
      
      // Verify value wasn't changed
      expect(TestEnum.FOO.value).toBe(originalValue);

      // Check if index is read-only
      const descriptor = Object.getOwnPropertyDescriptor(TestEnum.FOO, "index");
      expect(descriptor?.writable).toBe(false);
      expect(descriptor?.configurable).toBe(false);
      
      // Verify the enum itself is frozen
      expect(Object.isFrozen(TestEnum)).toBe(true);
      expect(Object.isFrozen(TestEnum.FOO)).toBe(true);
    })
  })

  describe("fromIndex", () => {
    it("should return correct enum value for valid index", () => {
      expect(TestEnum.fromIndex(0)).toBe(TestEnum.FOO)
      expect(TestEnum.fromIndex(1)).toBe(TestEnum.BAR)
      expect(TestEnum.fromIndex(2)).toBe(TestEnum.BAZ)
    })

    it("should return undefined for invalid index", () => {
      expect(TestEnum.fromIndex(999)).toBeUndefined()
      expect(TestEnum.fromIndex(-1)).toBeUndefined()
    })
  })

  describe("fromValue", () => {
    it("should return correct enum value for valid string", () => {
      expect(TestEnum.fromValue("foo")).toBe(TestEnum.FOO)
      expect(TestEnum.fromValue("bar")).toBe(TestEnum.BAR)
      expect(TestEnum.fromValue("baz")).toBe(TestEnum.BAZ)
    })

    it("should return undefined for invalid string", () => {
      expect(TestEnum.fromValue("invalid")).toBeUndefined()
    })
  })

  describe("fromKey", () => {
    it("should return correct enum value for valid key", () => {
      expect(TestEnum.fromKey("FOO")).toBe(TestEnum.FOO);
      expect(TestEnum.fromKey("BAR")).toBe(TestEnum.BAR);
      expect(TestEnum.fromKey("BAZ")).toBe(TestEnum.BAZ);
    });

    it("should return undefined for invalid key", () => {
      // Using type assertion to test invalid key case
      const result = TestEnum.fromKey("INVALID" as never);
      expect(result).toBeUndefined();
    })
  })

  describe("isEqual", () => {
    describe("instance method", () => {
      it("should return true when comparing with the same enum value", () => {
        expect(TestEnum.FOO.isEqual(TestEnum.FOO)).toBe(true)
      })

      it("should return false when comparing with a different enum value", () => {
        expect(TestEnum.FOO.isEqual(TestEnum.BAR)).toBe(false)
      })

      it("should return true when comparing with an array containing the same enum value", () => {
        expect(TestEnum.FOO.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(true)
      })

      it("should return false when comparing with an array not containing the enum value", () => {
        expect(TestEnum.FOO.isEqual([TestEnum.BAR, TestEnum.BAZ])).toBe(false)
      })
    })

    describe("factory method", () => {
      it("should return true when comparing the same enum value", () => {
        expect(TestEnum.isEqual(TestEnum.FOO)).toBe(true)
      })

      it("should handle single value comparison", () => {
        const testEnum = TestEnum.FOO
        expect(testEnum.isEqual(TestEnum.FOO)).toBe(true)
      })

      it("should handle array input", () => {
        // When passing an array, it should check if all values are the same as the first one
        expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.FOO])).toBe(true)
        expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(false)
      })
    })
  })

  describe("Auto-indexing", () => {
    it("should auto-assign indexes when not provided", () => {
      const AutoEnumMap = {
        ONE: { value: "one" },
        TWO: { value: "two" },
        THREE: { value: "three" }
      } as const

      const AutoEnum = CreateSafeEnum(AutoEnumMap)

      // Check that indexes are assigned sequentially starting from 0
      expect(AutoEnum.ONE.index).toBe(0)
      expect(AutoEnum.TWO.index).toBe(1)
      expect(AutoEnum.THREE.index).toBe(2)
    })

    it("should handle mixed explicit and auto indexes", () => {
      const MixedEnumMap = {
        ONE: { value: "one", index: 10 },
        TWO: { value: "two" },
        THREE: { value: "three", index: 20 },
        FOUR: { value: "four" }
      } as const

      const MixedEnum = CreateSafeEnum(MixedEnumMap)

      // Check that explicit indexes are preserved
      expect(MixedEnum.ONE.index).toBe(10)
      expect(MixedEnum.THREE.index).toBe(20)

      // Check that auto indexes don't conflict with explicit ones
      expect([MixedEnum.TWO.index, MixedEnum.FOUR.index]).toContain(0)
      expect([MixedEnum.TWO.index, MixedEnum.FOUR.index]).toContain(1)
      expect([11, 21]).not.toContain(MixedEnum.TWO.index)
      expect([11, 21]).not.toContain(MixedEnum.FOUR.index)
    })
  })

  describe("Frozen properties", () => {
    it("should freeze the enum object and its values", () => {
      expect(Object.isFrozen(TestEnum)).toBe(true);
      expect(Object.isFrozen(TestEnum.FOO)).toBe(true);
    });

    it("should not allow adding new properties", () => {
      // Test that the object is frozen by attempting to add a new property
      const testEnum = TestEnum as Record<string, any>;
      expectError(() => {
        testEnum.NEW_PROP = "test";
      });
    })
  })

  describe("Utility Methods", () => {
    describe("keys()", () => {
      it("should return all enum keys", () => {
        const keys = TestEnum.keys()
        expect(keys).toHaveLength(3)
        expect(keys).toContain("FOO")
        expect(keys).toContain("BAR")
        expect(keys).toContain("BAZ")
      })

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const)
        expect(EmptyEnum.keys()).toEqual([])
      })
    })

    describe("entries()", () => {
      it("should return all enum entries as [key, value] pairs", () => {
        const entries = TestEnum.entries()
        expect(entries).toHaveLength(3)

        const entryMap = new Map(entries)
        expect(entryMap.get("FOO")).toBe(TestEnum.FOO)
        expect(entryMap.get("BAR")).toBe(TestEnum.BAR)
        expect(entryMap.get("BAZ")).toBe(TestEnum.BAZ)
      })

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const)
        expect(EmptyEnum.entries()).toEqual([])
      })
    })

    describe("Iterator", () => {
      it("should be iterable with for...of", () => {
        const values = Array.from(TestEnum.values())
        expect(values).toHaveLength(3)
        expect(values).toContain(TestEnum.FOO)
        expect(values).toContain(TestEnum.BAR)
        expect(values).toContain(TestEnum.BAZ)
      })

      it("should work with spread operator", () => {
        const values = [...TestEnum.values()]
        expect(values).toHaveLength(3)
        expect(values).toContain(TestEnum.FOO)
      })
    })
  })

  describe("Existence Checks", () => {
    describe("hasValue()", () => {
      it("should return true for existing values", () => {
        expect(TestEnum.hasValue("foo")).toBe(true)
        expect(TestEnum.hasValue("bar")).toBe(true)
        expect(TestEnum.hasValue("baz")).toBe(true)
      })

      it("should return false for non-existent values", () => {
        expect(TestEnum.hasValue("nonexistent")).toBe(false)
        expect(TestEnum.hasValue("")).toBe(false)
        expect(TestEnum.hasValue(undefined as any)).toBe(false)
        expect(TestEnum.hasValue(null as any)).toBe(false)
        expect(TestEnum.hasValue(123 as any)).toBe(false)
      })

      it("should work with empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const)
        expect(EmptyEnum.hasValue("anything")).toBe(false)
      })
    })

    describe("hasKey()", () => {
      it("should return true for existing keys", () => {
        expect(TestEnum.hasKey("FOO")).toBe(true)
        expect(TestEnum.hasKey("BAR")).toBe(true)
        expect(TestEnum.hasKey("BAZ")).toBe(true)
      })

      it("should return false for non-existent keys", () => {
        expect(TestEnum.hasKey("NONEXISTENT")).toBe(false)
        expect(TestEnum.hasKey("")).toBe(false)
        expect(TestEnum.hasKey(undefined as any)).toBe(false)
        expect(TestEnum.hasKey(null as any)).toBe(false)
        expect(TestEnum.hasKey(123 as any)).toBe(false)
      })
    })

    describe("hasIndex()", () => {
      it("should return true for existing indices", () => {
        expect(TestEnum.hasIndex(0)).toBe(true)
        expect(TestEnum.hasIndex(1)).toBe(true)
        expect(TestEnum.hasIndex(2)).toBe(true)
      })

      it("should return false for non-existent indices", () => {
        expect(TestEnum.hasIndex(-1)).toBe(false)
        expect(TestEnum.hasIndex(999)).toBe(false)
        expect(TestEnum.hasIndex(NaN)).toBe(false)
        expect(TestEnum.hasIndex(undefined as any)).toBe(false)
        expect(TestEnum.hasIndex(null as any)).toBe(false)
        expect(TestEnum.hasIndex("0" as any)).toBe(false)
      })
    })


  })

  describe("Type Safety", () => {
    it("should narrow types with isEnumValue", () => {
      const maybeEnum = { key: "FOO", value: "foo", index: 0 }
      if (TestEnum.isEnumValue(maybeEnum)) {
        expect(maybeEnum.key).toBe("FOO")
        expect(maybeEnum.value).toBe("foo")
        expect(maybeEnum.index).toBe(0)
      } else {
        throw new Error("Type guard failed")
      }
    })

    it("should reject invalid values with isEnumValue", () => {
      expect(TestEnum.isEnumValue(undefined)).toBe(false)
      expect(TestEnum.isEnumValue(null)).toBe(false)
      expect(TestEnum.isEnumValue({})).toBe(false)
      expect(TestEnum.isEnumValue({ key: "FOO" })).toBe(false)
      expect(TestEnum.isEnumValue({ value: "foo" })).toBe(false)
      expect(TestEnum.isEnumValue({ index: 0 })).toBe(false)
      expect(TestEnum.isEnumValue({ key: "NOPE", value: "nope", index: 999 })).toBe(false)
    })

    describe("hasValue()", () => {
      it("should return true for existing enum values", () => {
        expect(TestEnum.hasValue("foo")).toBe(true)
        expect(TestEnum.hasValue("bar")).toBe(true)
        expect(TestEnum.hasValue("baz")).toBe(true)
      })

      it("should return false for non-existent values", () => {
        expect(TestEnum.hasValue("nonexistent")).toBe(false)
        expect(TestEnum.hasValue("")).toBe(false)
        expect(TestEnum.hasValue(undefined as any)).toBe(false)
        expect(TestEnum.hasValue(null as any)).toBe(false)
        expect(TestEnum.hasValue(123 as any)).toBe(false)
        expect(TestEnum.hasValue({} as any)).toBe(false)
      })

      it("should work with empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const)
        expect(EmptyEnum.hasValue("anything")).toBe(false)
      })

      it("should work with single-value enums", () => {
        const SingleEnum = CreateSafeEnum({
          ONLY: { value: "only", index: 0 }
        } as const)
        expect(SingleEnum.hasValue("only")).toBe(true)
        expect(SingleEnum.hasValue("nonexistent")).toBe(false)
      })

      it("should work with sparse indices", () => {
        const SparseEnum = CreateSafeEnum({
          A: { value: "a", index: 10 },
          B: { value: "b", index: 20 },
          C: { value: "c" } // Auto-assigned
        } as const)
        expect(SparseEnum.hasValue("a")).toBe(true)
        expect(SparseEnum.hasValue("b")).toBe(true)
        expect(SparseEnum.hasValue("c")).toBe(true)
        expect(SparseEnum.hasValue("nonexistent")).toBe(false)
      })
    })
  })

  describe("Edge Cases", () => {
    it("should create enum from array of strings using CreateSafeEnumFromArray", () => {
      const Status = CreateSafeEnumFromArray(["pending", "approved", "rejected"] as const);
      expect(Status["PENDING"].value).toBe("pending");
      expect(Status["APPROVED"].value).toBe("approved");
      expect(Status["REJECTED"].value).toBe("rejected");
      expect(Status["PENDING"].index).toBe(0);
      expect(Status["APPROVED"].index).toBe(1);
      expect(Status["REJECTED"].index).toBe(2);
      // Should have same lookup by value (fromValue)
      expect(Status.fromValue("pending")).toBe(Status["PENDING"]);
      expect(Status.fromValue("approved")).toBe(Status["APPROVED"]);
      expect(Status.fromValue("rejected")).toBe(Status["REJECTED"]);
      // Should have lookup by index (fromIndex)
      expect(Status.fromIndex(0)).toBe(Status["PENDING"]);
      expect(Status.fromIndex(1)).toBe(Status["APPROVED"]);
      expect(Status.fromIndex(2)).toBe(Status["REJECTED"]);
      // Should have keys and entries
      expect(Status.keys()).toEqual(["PENDING", "APPROVED", "REJECTED"]);
      expect(Status.entries().map(([,e]) => e.value)).toEqual(["pending", "approved", "rejected"]);
      // Should be frozen
      expect(Object.isFrozen(Status)).toBe(true);
      expect(Object.isFrozen(Status["PENDING"])).toBe(true);
      // Should have read-only properties
      expect(() => { (Status["PENDING"] as any).value = "foo" }).toThrow();
    });
    it("should handle empty enum", () => {
      const EmptyEnum = CreateSafeEnum({} as const)
      expect(EmptyEnum.keys()).toEqual([])
      expect(EmptyEnum.entries()).toEqual([])
      expect(Array.from(EmptyEnum.values())).toEqual([])
    })

    it("should handle single-value enum", () => {
      const SingleEnum = CreateSafeEnum({
        ONLY: { value: "only", index: 0 }
      } as const)

      expect(SingleEnum.keys()).toEqual(["ONLY"])
      expect(SingleEnum.entries()).toEqual([["ONLY", SingleEnum.ONLY]])

      const singleValues = Array.from(SingleEnum.values())
      expect(singleValues).toEqual([SingleEnum.ONLY])
    })

    it("should handle sparse indices", () => {
      const SparseEnum = CreateSafeEnum({
        A: { value: "a", index: 10 },
        B: { value: "b", index: 20 },
        C: { value: "c" } // Auto-assigned
      } as const);

      expect(SparseEnum.C.index).not.toBe(10);
      expect(SparseEnum.C.index).not.toBe(20);

      const values: { index: number }[] = Array.from(SparseEnum.values());
      const indices = values.map(v => v.index);
      expect(indices).toHaveLength(3);
      expect(indices).toContain(10);
      expect(indices).toContain(20);
      expect(indices).toContain(SparseEnum.C.index);
    });

    it("should provide helpful error for duplicate indices", () => {
      expect(() => {
        CreateSafeEnum({
          A: { value: "a", index: 1 },
          B: { value: "b", index: 1 } // Duplicate index
        } as const)
      }).toThrow("Duplicate index 1 found in enum map: 'B' conflicts with 'A'")
    })
  })
})
