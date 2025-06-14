import { CreateSafeEnum, CreateSafeEnumFromArray } from "./safe-enum-factory"
import type { SafeEnum } from "./types/interfaces/safe-enum"
import { describe, it, expect, afterAll, vi } from 'vitest'

// Mock console.error to avoid polluting test output
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { /* intentionally empty for test */ })



describe("SafeEnum", () => {
  // Define a test enum
  const testEnumMap = {
    FOO: { value: 'foo', index: 0 },
    BAR: { value: 'bar', index: 1 },
    BAZ: { value: 'baz', index: 2 }
  } as const

  const testEnum = CreateSafeEnum(testEnumMap)
 
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
    it("should ensure enum value properties are immutable", () => {
      // This tests the immutability logic in lines 67-73
      // Create an object with a non-writable value property
      const obj = { value: 'test', index: 0 };
      Object.defineProperty(obj, 'value', {
        value: 'test',
        writable: false,
        configurable: true,
        enumerable: true
      });
      
      // Verify it's not writable initially
      const initialDescriptor = Object.getOwnPropertyDescriptor(obj, 'value');
      expect(initialDescriptor?.writable).toBe(false);
      
      // Create enum with this object
      const TestImmutable = CreateSafeEnum({ TEST: obj });
      
      // The value property should still be non-writable
      const descriptor = Object.getOwnPropertyDescriptor(TestImmutable.TEST, 'value');
      expect(descriptor?.writable).toBe(false);
      expect(descriptor?.configurable).toBe(false);
      expect(descriptor?.enumerable).toBe(true);
      expect(TestImmutable.TEST.value).toBe('test');
      
      // Attempting to modify should throw in strict mode or fail silently in non-strict
      expect(() => {
        // @ts-expect-error - Testing immutability
        TestImmutable.TEST.value = 'modified';
      }).toThrow(TypeError);
      
      // Verify the value wasn't changed
      expect(TestImmutable.TEST.value).toBe('test');
    });

    it("should create enum with correct values", () => {
      expect(testEnum.FOO).toEqual(
        expect.objectContaining({
          value: "foo",
          index: 0
        })
      )
      expect(testEnum.BAR).toEqual(
        expect.objectContaining({
          value: "bar",
          index: 1
        })
      )
      expect(testEnum.BAZ).toEqual(
        expect.objectContaining({
          value: "baz",
          index: 2
        })
      )
    })

    it("should make properties read-only", () => {
      // Check if properties are read-only
      const originalValue = testEnum.FOO.value;
      
      // Attempt to modify read-only property
      expectError(() => {
        // @ts-expect-error - Testing read-only property
        testEnum.FOO.value = "new value";
      });
      
      // Verify value wasn't changed
      expect(testEnum.FOO.value).toBe(originalValue);

      // Check if index is read-only
      const descriptor = Object.getOwnPropertyDescriptor(testEnum.FOO, "index");
      expect(descriptor?.writable).toBe(false);
      expect(descriptor?.configurable).toBe(false);
      
      // Verify the enum itself is frozen
      expect(Object.isFrozen(testEnum)).toBe(true);
      expect(Object.isFrozen(testEnum.FOO)).toBe(true);
    })
  })

  describe("fromIndex", () => {
    it("should return correct enum value for valid index", () => {
      expect(testEnum.fromIndex(0)).toBe(testEnum.FOO)
      expect(testEnum.fromIndex(1)).toBe(testEnum.BAR)
      expect(testEnum.fromIndex(2)).toBe(testEnum.BAZ)
    })

    it("should return undefined for invalid index", () => {
      expect(testEnum.fromIndex(999)).toBeUndefined()
      expect(testEnum.fromIndex(-1)).toBeUndefined()
    })
  })

  describe("fromValue", () => {
    it("should return correct enum value for valid string", () => {
      expect(testEnum.fromValue("foo")).toBe(testEnum.FOO)
      expect(testEnum.fromValue("bar")).toBe(testEnum.BAR)
      expect(testEnum.fromValue("baz")).toBe(testEnum.BAZ)
    })

    it("should return undefined for invalid string", () => {
      expect(testEnum.fromValue("invalid")).toBeUndefined()
    })
  })

  describe("fromKey", () => {
    it("should return correct enum value for valid key", () => {
      expect(testEnum.fromKey("FOO")).toBe(testEnum.FOO);
      expect(testEnum.fromKey("BAR")).toBe(testEnum.BAR);
      expect(testEnum.fromKey("BAZ")).toBe(testEnum.BAZ);
    });

    it("should return undefined for invalid key", () => {
      // Using type assertion to test invalid key case
      const result = testEnum.fromKey("INVALID" as never);
      expect(result).toBeUndefined();
    })
  })

  describe("isEqual", () => {
    describe("instance method", () => {
      it("should return true when comparing with the same enum value", () => {
        expect(testEnum.FOO.isEqual(testEnum.FOO)).toBe(true)
      })

      it("should return false when comparing with a different enum value", () => {
        expect(testEnum.FOO.isEqual(testEnum.BAR)).toBe(false)
      })

      it("should return true when comparing with an array containing the same enum value", () => {
        expect(testEnum.FOO.isEqual([testEnum.FOO, testEnum.BAR])).toBe(true)
      })

      it("should return false when comparing with an array not containing the enum value", () => {
        expect(testEnum.FOO.isEqual([testEnum.BAR, testEnum.BAZ])).toBe(false)
      })
    })

    describe("factory method", () => {
      it("should return true when comparing the same enum value", () => {
        expect(testEnum.isEqual(testEnum.FOO)).toBe(true)
      })

      it("should handle single value comparison", () => {
        const enumValue = testEnum.FOO
        expect(enumValue.isEqual(testEnum.FOO)).toBe(true)
      })

      it("should handle array input", () => {
        // When passing an array, it should check if all values are the same as the first one
        expect(testEnum.isEqual([testEnum.FOO, testEnum.FOO])).toBe(true)
        expect(testEnum.isEqual([testEnum.FOO, testEnum.BAR])).toBe(false)
      })
    })
  })

  describe("Auto-indexing", () => {
    it("should auto-assign indexes when not provided", () => {
      const autoEnumMap = {
        ONE: { value: "one" },
        TWO: { value: "two" },
        THREE: { value: "three" }
      } as const

      const autoEnum = CreateSafeEnum(autoEnumMap)
      
      // Check that indexes are assigned sequentially starting from 0
      expect(autoEnum.ONE.index).toBe(0)
      expect(autoEnum.TWO.index).toBe(1)
      expect(autoEnum.THREE.index).toBe(2)
      
      // Test instance usage pattern
      const instance = autoEnum.fromKey("ONE")
      expect(instance).toBeDefined()
      expect(instance?.value).toBe("one")
    })

    it("should handle mixed explicit and auto indexes", () => {
      const mixedEnumMap = {
        ONE: { value: "one", index: 10 },
        TWO: { value: "two" },
        THREE: { value: "three", index: 20 },
        FOUR: { value: "four" }
      } as const

      const mixedEnum = CreateSafeEnum(mixedEnumMap)
      
      // Check that explicit indexes are preserved
      expect(mixedEnum.ONE.index).toBe(10)
      expect(mixedEnum.THREE.index).toBe(20)
      
      // Check that auto-indexed values get the next available index
      expect(mixedEnum.TWO.index).toBe(21)
      expect(mixedEnum.FOUR.index).toBe(22)
      
      // Test instance usage pattern
      const instance1 = mixedEnum.fromKey("ONE")
      const instance2 = mixedEnum.fromValue("two")
      expect(instance1).toBeDefined()
      expect(instance2).toBeDefined()
      expect(instance1?.value).toBe("one")
      expect(instance2?.value).toBe("two")
    })
  })

  describe("Frozen properties", () => {
    it("should freeze the enum object and its values", () => {
      expect(Object.isFrozen(testEnum)).toBe(true);
      expect(Object.isFrozen(testEnum.FOO)).toBe(true);
    });

    it("should not allow adding new properties", () => {
      // Test that the object is frozen by attempting to add a new property
      const enumObj = testEnum as unknown as Record<string, any>;
      expectError(() => {
        enumObj.NEW_PROP = "test";
      });
    })
  })

  describe("Utility Methods", () => {
    describe("keys()", () => {
      it("should return all enum keys", () => {
        const keys = testEnum.keys()
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
        const entries = testEnum.entries()
        expect(entries).toHaveLength(3)

        const entryMap = new Map(entries)
        expect(entryMap.get("FOO")).toBe(testEnum.FOO)
        expect(entryMap.get("BAR")).toBe(testEnum.BAR)
        expect(entryMap.get("BAZ")).toBe(testEnum.BAZ)
      })

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const)
        expect(EmptyEnum.entries()).toEqual([])
      })
    })

    describe("Iterator", () => {
      it("should be iterable with for...of", () => {
        const values = Array.from(testEnum.getEntries())
        expect(values).toHaveLength(3)
        expect(values).toContain(testEnum.FOO)
        expect(values).toContain(testEnum.BAR)
        expect(values).toContain(testEnum.BAZ)
      })

      it("should work with spread operator", () => {
        const values = [...testEnum.getEntries()]
        expect(values).toHaveLength(3)
        expect(values).toContain(testEnum.FOO)
      })
    })
  })

  describe("Existence Checks", () => {
    describe("hasValue()", () => {
      it("should return true for existing values", () => {
        expect(testEnum.hasValue("foo")).toBe(true)
        expect(testEnum.hasValue("bar")).toBe(true)
        expect(testEnum.hasValue("baz")).toBe(true)
      })

      it("should return false for non-existent values", () => {
        expect(testEnum.hasValue("nonexistent")).toBe(false)
        expect(testEnum.hasValue("")).toBe(false)
        expect(testEnum.hasValue(undefined as any)).toBe(false)
        expect(testEnum.hasValue(null as any)).toBe(false)
        expect(testEnum.hasValue(123 as any)).toBe(false)
      })

      it("should work with empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const)
        expect(EmptyEnum.hasValue("anything")).toBe(false)
      })
    })

    describe("hasKey()", () => {
      it("should return true for existing keys", () => {
        expect(testEnum.hasKey("FOO")).toBe(true)
        expect(testEnum.hasKey("BAR")).toBe(true)
        expect(testEnum.hasKey("BAZ")).toBe(true)
      })

      it("should return false for non-existent keys", () => {
        expect(testEnum.hasKey("NONEXISTENT")).toBe(false)
        expect(testEnum.hasKey("")).toBe(false)
        expect(testEnum.hasKey(undefined as any)).toBe(false)
        expect(testEnum.hasKey(null as any)).toBe(false)
        expect(testEnum.hasKey(123 as any)).toBe(false)
      })
    })

    describe("hasIndex()", () => {
      it("should return true for existing indices", () => {
        expect(testEnum.hasIndex(0)).toBe(true)
        expect(testEnum.hasIndex(1)).toBe(true)
        expect(testEnum.hasIndex(2)).toBe(true)
      })

      it("should return false for non-existent indices", () => {
        expect(testEnum.hasIndex(-1)).toBe(false)
        expect(testEnum.hasIndex(999)).toBe(false)
        expect(testEnum.hasIndex(NaN)).toBe(false)
        expect(testEnum.hasIndex(undefined as any)).toBe(false)
        expect(testEnum.hasIndex(null as any)).toBe(false)
        expect(testEnum.hasIndex("0" as any)).toBe(false)
      })
    })
  })

  describe("Type Safety", () => {
    it("should narrow types with isEnumValue", () => {
      const maybeEnum = { key: "FOO", value: "foo", index: 0 }
      if (!testEnum.isEnumValue(maybeEnum)) {
        throw new Error("Type guard should have narrowed the type");
      }
      expect(maybeEnum.key).toBe("FOO")
      expect(maybeEnum.value).toBe("foo")
      expect(maybeEnum.index).toBe(0)
    })

    describe("hasValue()", () => {
      it("should return true for existing enum values", () => {
        expect(testEnum.hasValue("foo")).toBe(true)
        expect(testEnum.hasValue("bar")).toBe(true)
        expect(testEnum.hasValue("baz")).toBe(true)
      })

      it("should return false for non-existent values", () => {
        expect(testEnum.hasValue("nonexistent")).toBe(false)
        expect(testEnum.hasValue("")).toBe(false)
        expect(testEnum.hasValue(undefined as any)).toBe(false)
        expect(testEnum.hasValue(null as any)).toBe(false)
        expect(testEnum.hasValue(123 as any)).toBe(false)
        expect(testEnum.hasValue({} as any)).toBe(false)
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

  describe("Utility Methods", () => {
    describe("values()", () => {
      it("should return an array of all enum values", () => {
        const values = testEnum.values()
        expect(values).toHaveLength(3)
        expect(values).toContain("foo")
        expect(values).toContain("bar")
        expect(values).toContain("baz")
      })

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const)
        expect(EmptyEnum.values()).toEqual([])
      })
    })

    describe("getEntries()", () => {
      it("should return an array of all enum entries", () => {
        const entries = testEnum.getEntries()
        expect(entries).toHaveLength(3)
        expect(entries.map(e => e.value)).toContain("foo")
        expect(entries.map(e => e.key)).toContain("FOO")
      })
    })

    describe("indexes()", () => {
      it("should return an array of all enum indices", () => {
        const indices = testEnum.indexes()
        expect(indices).toHaveLength(3)
        expect(indices).toContain(0)
        expect(indices).toContain(1)
        expect(indices).toContain(2)
      })

      it("should handle custom indices", () => {
        const CustomEnum = CreateSafeEnum({
          A: { value: "a", index: 10 },
          B: { value: "b", index: 20 },
          C: { value: "c" } // Auto-assigned
        } as const)
        const indices = CustomEnum.indexes()
        expect(indices).toHaveLength(3)
        expect(indices).toContain(10)
        expect(indices).toContain(20)
        expect(indices).toContain(CustomEnum.C.index)
      })

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const)
        expect(EmptyEnum.indexes()).toEqual([])
      })
    })
  })

  describe("String Representation", () => {
    it("should provide a meaningful string representation with toString()", () => {
      expect(testEnum.FOO.toString()).toBe("FOO: (foo), index: 0")
      expect(testEnum.BAR.toString()).toBe("BAR: (bar), index: 1")
      expect(testEnum.BAZ.toString()).toBe("BAZ: (baz), index: 2")
    })

    it("should be called automatically in string interpolation", () => {
      const str = `Status: ${testEnum.FOO}`
      expect(str).toContain("FOO: (foo), index: 0")
    })

    it("should provide a JSON-serializable object with toJSON()", () => {
      expect(testEnum.FOO.toJSON()).toEqual({
        key: "FOO",
        value: "foo",
        index: 0
      })

      expect(testEnum.BAR.toJSON()).toEqual({
        key: "BAR",
        value: "bar",
        index: 1
      })
    })

    it("should be used by JSON.stringify()", () => {
      const json = JSON.stringify({ status: testEnum.FOO })
      const parsed = JSON.parse(json)
      expect(parsed).toEqual({
        status: {
          key: "FOO",
          value: "foo",
          index: 0
        }
      })
    })
  })

  describe("Error Handling", () => {
    it("should throw error when enum entry is missing an index", () => {
      // This tests the error handling in lines 143-144
      // Create a function that will be called with an object that has a missing index
      const createEnumWithMissingIndex = () => {
        // This is a bit of a hack to test the error case
        // We're creating an object that will cause the destructuring to fail
        const badEnumMap = {
          FOO: { value: 'foo', index: 0 },
          // Create a getter that returns an object without an index property
          get BAR() {
            return { value: 'bar' };
          }
        };
        return CreateSafeEnum(badEnumMap);
      };
      
      // The error should be thrown during enum creation
      expect(createEnumWithMissingIndex).toThrow("Missing index for enum key: BAR");
    });
  });

describe("CreateSafeEnumFromArray", () => {
  it("should create enum from array of strings", () => {
    const Status = CreateSafeEnumFromArray(["pending", "approved", "rejected"] as const);
    
    expect(Status.PENDING).toBeDefined();
    expect(Status.APPROVED).toBeDefined();
    expect(Status.REJECTED).toBeDefined();
    
    expect(Status.PENDING.value).toBe("pending");
    expect(Status.APPROVED.value).toBe("approved");
    expect(Status.REJECTED.value).toBe("rejected");
    
    expect(Status.PENDING.index).toBe(0);
    expect(Status.APPROVED.index).toBe(1);
    expect(Status.REJECTED.index).toBe(2);
    
    // Test lookup methods
    expect(Status.fromValue("pending")).toBe(Status.PENDING);
    expect(Status.fromIndex(1)).toBe(Status.APPROVED);
    
    // Test utility methods
    expect(Status.keys()).toEqual(["PENDING", "APPROVED", "REJECTED"]);
      
      const result = testEnum.fromIndex(999)
      expect(result).toBeUndefined()
    expect(Status.REJECTED).toBeDefined()
      
    expect(Status.PENDING.value).toBe("pending")
    expect(Status.APPROVED.value).toBe("approved")
    expect(Status.REJECTED.value).toBe("rejected")
      
    expect(Status.PENDING.index).toBe(0)
    expect(Status.APPROVED.index).toBe(1)
    expect(Status.REJECTED.index).toBe(2)
      
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
      // Should be frozen
      expect(Object.isFrozen(EmptyEnum)).toBe(true)
    });

    it("should handle single-value enum", () => {
      const SingleEnum = CreateSafeEnum({
        ONLY: { value: "only", index: 0 }
      } as const)

      expect(SingleEnum.keys()).toEqual(["ONLY"])
      expect(SingleEnum.entries()).toEqual([["ONLY", SingleEnum.ONLY]])

      const singleValues = SingleEnum.getEntries()
      expect(singleValues).toEqual([SingleEnum.ONLY])
      expect(SingleEnum.values()).toEqual(['only'])
    });

    it("should handle sparse indices", () => {
      const SparseEnum = CreateSafeEnum({
        A: { value: "a", index: 10 },
        B: { value: "b", index: 20 },
        C: { value: "c", index: 30 } // Explicit index
      } as const);

      expect(SparseEnum.C.index).toBe(30);
      expect(SparseEnum.A.index).toBe(10);
      expect(SparseEnum.B.index).toBe(20);
    });

    it("should handle sparse indices with auto-assignment", () => {
      const SparseEnum = CreateSafeEnum({
        A: { value: "a", index: 10 },
        B: { value: "b", index: 20 },
        C: { value: "c" } // Auto-assigned index
      } as const);

      expect(SparseEnum.A.index).toBe(10);
      expect(SparseEnum.B.index).toBe(20);
      expect(SparseEnum.C.index).not.toBe(10);
      expect(SparseEnum.C.index).not.toBe(20);
      expect(SparseEnum.C.index).toBeGreaterThanOrEqual(0);

      const indices = SparseEnum.indexes();
      expect(indices).toContain(10);
      expect(indices).toContain(20);
      expect(indices).toContain(SparseEnum.C.index);
      expect(SparseEnum.values()).toEqual(['a', 'b', 'c']);
    });

    it("should throw error for duplicate indices", () => {
      expect(() => {
        CreateSafeEnum({
          A: { value: "a", index: 1 },
          B: { value: "b", index: 1 } // Duplicate index
        } as const);
      }).toThrow("Duplicate index 1 in enum map: 'B' conflicts with 'A'");
    });
  });
});

describe("Type System", () => {
  it("should allow using SafeEnum as a type alias", () => {
    // This is a type test - it will fail to compile if the types are incorrect
    type RequestType = SafeEnum;
    
    // Create a test enum
    const TestEnum = CreateSafeEnum({
      GET: { value: 'get', index: 0 },
      POST: { value: 'post', index: 1 }
    } as const);
    
    // Test that we can assign an enum value to a variable of type RequestType
    const getRequest: RequestType = TestEnum.GET;
    const postRequest: RequestType = TestEnum.POST;
    
    // Verify the values are correct at runtime
    expect(getRequest.value).toBe('get');
    expect(postRequest.value).toBe('post');
    
    // Test that the type is preserved in function parameters
    function processRequest(request: RequestType): string {
      return `Processing ${request.key} request (${request.value})`;
    }
    
    expect(processRequest(TestEnum.GET)).toBe('Processing GET request (get)');
    expect(processRequest(TestEnum.POST)).toBe('Processing POST request (post)');
  });
});
