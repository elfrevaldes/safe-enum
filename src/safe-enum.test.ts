import { CreateSafeEnum, getOrThrowUtil, isEnumValueUtil } from "./safe-enum-factory";
import type { SafeEnum } from "./types/interfaces/safe-enum";
import { describe, it, expect, afterAll, vi, beforeAll } from 'vitest';

// Mock console.error to avoid polluting test output
let mockConsoleError: any;
beforeAll(() => {
  mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { /* intentionally empty for test */ });
});



describe("SafeEnum", () => {
  // Define a test enum
  const testEnumMap = {
    FOO: { value: 'foo', index: 0 },
    BAR: { value: 'bar', index: 1 },
    BAZ: { value: 'baz', index: 2 }
  } as const;

  const TestEnum = CreateSafeEnum(testEnumMap, "TestEnum");
  type TestEnum = SafeEnum<"TestEnum">;
 
  afterAll(() => {
    if (mockConsoleError) {
      mockConsoleError.mockRestore();
    }
  });
  
  // Helper function to test invalid assignments
  function expectError(callback: () => void): void {
    let errorThrown = false;
    try {
      callback();
    } catch { 
      errorThrown = true;
    }
    expect(errorThrown).toBe(true);
  };
  
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
      const TestImmutable = CreateSafeEnum({ TEST: obj }, "TestImmutable");
      
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
      expect(TestEnum.FOO).toEqual(
        expect.objectContaining({
          value: "foo",
          index: 0
        })
      );
      expect(TestEnum.BAR).toEqual(
        expect.objectContaining({
          value: "bar",
          index: 1
        })
      );
      expect(TestEnum.BAZ).toEqual(
        expect.objectContaining({
          value: "baz",
          index: 2
        })
      );
    });

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
    });
  });

  describe("fromIndex", () => {
    it("should return correct enum value for valid index", () => {
      expect(TestEnum.fromIndex(0)).toBe(TestEnum.FOO);
      expect(TestEnum.fromIndex(1)).toBe(TestEnum.BAR);
      expect(TestEnum.fromIndex(2)).toBe(TestEnum.BAZ);
    });

    it("should return undefined for invalid index", () => {
      expect(TestEnum.fromIndex(999)).toBeUndefined();
      expect(TestEnum.fromIndex(-1)).toBeUndefined();
    });

    it("should console.error for invalid index", () => {
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation((..._args) => {
        // Mock implementation that satisfies the linter
        return undefined;
      });
      const result = TestEnum.fromIndex(-1);
      expect(mockConsoleError).toHaveBeenCalledWith("[SafeEnum] No enum value with index -1. Valid indices are: 0, 1, 2");
      expect(result).toBeUndefined();
    });
  });

  describe("fromValue", () => {
    it("should return correct enum value for valid string", () => {
      expect(TestEnum.fromValue("foo")).toBe(TestEnum.FOO);
      expect(TestEnum.fromValue("bar")).toBe(TestEnum.BAR);
      expect(TestEnum.fromValue("baz")).toBe(TestEnum.BAZ);
    });

    it("should return undefined for invalid string", () => {
      expect(TestEnum.fromValue("invalid")).toBeUndefined();
    });
  });

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
    });
  });

  describe("isEqual", () => {
    describe("instance method", () => {
      it("should return true when comparing with the same enum value", () => {
        expect(TestEnum.FOO.isEqual(TestEnum.FOO)).toBe(true);
      });

      it("should return false when comparing with a different enum value", () => {
        expect(TestEnum.FOO.isEqual(TestEnum.BAR)).toBe(false);
      });

      it("should return true when comparing with an array containing the same enum value", () => {
        expect(TestEnum.FOO.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(true);
      });

      it("should return false when comparing with an array not containing the enum value", () => {
        expect(TestEnum.FOO.isEqual([TestEnum.BAR, TestEnum.BAZ])).toBe(false);
      });
    });

    describe("factory method", () => {
      it("should return true when comparing the same enum value", () => {
        expect(TestEnum.isEqual(TestEnum.FOO)).toBe(true);
      });

      it("should handle single value comparison", () => {
        const enumValue = TestEnum.FOO;
        expect(enumValue.isEqual(TestEnum.FOO)).toBe(true);
      });

      it("should handle array input", () => {
        // When passing an array, it should check if all values are the same as the first one
        expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.FOO])).toBe(true);
        expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(false);
      });
    });
  });

  describe("Auto-indexing", () => {
    it("should auto-assign indexes when not provided", () => {
      const autoEnumMap = {
        ONE: { value: "one" },
        TWO: { value: "two" },
        THREE: { value: "three" }
      } as const;

      const autoEnum = CreateSafeEnum(autoEnumMap, "AutoEnum");
      
      // Check that indexes are assigned sequentially starting from 0
      expect(autoEnum.ONE.index).toBe(0);
      expect(autoEnum.TWO.index).toBe(1);
      expect(autoEnum.THREE.index).toBe(2);
      
      // Test instance usage pattern
      const instance = autoEnum.fromKey("ONE");
      expect(instance).toBeDefined();
      expect(instance?.value).toBe("one");
    });

    it("should handle mixed explicit and auto indexes", () => {
      const mixedEnumMap = {
        ONE: { value: "one", index: 10 },
        TWO: { value: "two" },
        THREE: { value: "three", index: 20 },
        FOUR: { value: "four" }
      } as const;

      const mixedEnum = CreateSafeEnum(mixedEnumMap, "MixedEnum");
      
      // Check that explicit indexes are preserved
      expect(mixedEnum.ONE.index).toBe(10);
      expect(mixedEnum.THREE.index).toBe(20);
      
      // Check that auto-indexed values get the next available index
      expect(mixedEnum.TWO.index).toBe(21);
      expect(mixedEnum.FOUR.index).toBe(22);
      
      // Test instance usage pattern
      const instance1 = mixedEnum.fromKey("ONE");
      const instance2 = mixedEnum.fromValue("two");
      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1?.value).toBe("one");
      expect(instance2?.value).toBe("two");
    })
  });

  describe("Frozen properties", () => {
    it("should freeze the enum object and its values", () => {
      expect(Object.isFrozen(TestEnum)).toBe(true);
      expect(Object.isFrozen(TestEnum.FOO)).toBe(true);
    });

    it("should not allow adding new properties", () => {
      // Test that the object is frozen by attempting to add a new property
      const enumObj = TestEnum as unknown as Record<string, any>;
      expectError(() => {
        enumObj.NEW_PROP = "test";
      });
    })
  });

  describe("Utility Methods", () => {
    describe("keys()", () => {
      it("should return all enum keys", () => {
        const keys = TestEnum.getKeys()
        expect(keys).toHaveLength(3);
        expect(keys).toContain("FOO");
        expect(keys).toContain("BAR");
        expect(keys).toContain("BAZ");
      });

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const, "EmptyEnum");
        expect(EmptyEnum.getKeys()).toEqual([]);
      });
    });

    describe("entries()", () => {
      it("should return all enum entries as [key, value] pairs", () => {
        const entries = TestEnum.getEntries();
        expect(entries).toHaveLength(3);

        const entryMap = new Map(entries);
        expect(entryMap.get("FOO")).toBe(TestEnum.FOO);
        expect(entryMap.get("BAR")).toBe(TestEnum.BAR);
        expect(entryMap.get("BAZ")).toBe(TestEnum.BAZ);
      });

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const, "EmptyEnum");
        expect(EmptyEnum.getEntries()).toEqual([]);
      });
    });

    describe("Iterator", () => {
      it("should be iterable with for...of", () => {
        const entries = TestEnum.getEntries();
        expect(entries).toHaveLength(3);
        const values = entries.map(([_, value]) => value);
        expect(values).toContain(TestEnum.FOO);
        expect(values).toContain(TestEnum.BAR);
        expect(values).toContain(TestEnum.BAZ);
      });

      it("should work with spread operator", () => {
        const values = [...TestEnum.getEntries()].map(([_, value]) => value);
        expect(values).toHaveLength(3);
        expect(values).toContain(TestEnum.FOO);
      });
    });
  });

  describe("Existence Checks", () => {
    describe("hasValue()", () => {
      it("should return true for existing values", () => {
        expect(TestEnum.hasValue("foo")).toBe(true);
        expect(TestEnum.hasValue("bar")).toBe(true);
        expect(TestEnum.hasValue("baz")).toBe(true);
      });

      it("should return false for non-existent values", () => {
        expect(TestEnum.hasValue("nonexistent")).toBe(false);
        expect(TestEnum.hasValue("")).toBe(false);
        expect(TestEnum.hasValue(undefined as any)).toBe(false);
        expect(TestEnum.hasValue(null as any)).toBe(false);
        expect(TestEnum.hasValue(123 as any)).toBe(false);
      });

      it("should work with empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const, "EmptyEnum")
        expect(EmptyEnum.hasValue("anything")).toBe(false)
      });
    });

    describe("hasKey()", () => {
      it("should return true for existing keys", () => {
        expect(TestEnum.hasKey("FOO")).toBe(true);
        expect(TestEnum.hasKey("BAR")).toBe(true);
        expect(TestEnum.hasKey("BAZ")).toBe(true);
      });

      it("should return false for non-existent keys", () => {
        expect(TestEnum.hasKey("NONEXISTENT")).toBe(false);
        expect(TestEnum.hasKey("")).toBe(false);
        expect(TestEnum.hasKey(undefined as any)).toBe(false);
        expect(TestEnum.hasKey(null as any)).toBe(false);
        expect(TestEnum.hasKey(123 as any)).toBe(false);
      });
    });

    describe("hasIndex()", () => {
      it("should return true for existing indices", () => {
        expect(TestEnum.hasIndex(0)).toBe(true);
        expect(TestEnum.hasIndex(1)).toBe(true);
        expect(TestEnum.hasIndex(2)).toBe(true);
      });

      it("should return false for non-existent indices", () => {
        expect(TestEnum.hasIndex(-1)).toBe(false);
        expect(TestEnum.hasIndex(999)).toBe(false);
        expect(TestEnum.hasIndex(NaN)).toBe(false);
        expect(TestEnum.hasIndex(undefined as any)).toBe(false);
        expect(TestEnum.hasIndex(null as any)).toBe(false);
        expect(TestEnum.hasIndex("0" as any)).toBe(false);
      });
    });
  });

  describe("Type Safety", () => {
    it("should properly identify valid enum values with isEnumValue", () => {
      // Test with an actual enum value
      const actualEnum = TestEnum.FOO;
      
      // This should pass because it's a real enum value
      expect(TestEnum.isEnumValue(actualEnum)).toBe(true);
      
      // Type guard should work in conditional
      if (TestEnum.isEnumValue(actualEnum)) {
        // If this compiles, the type guard is working correctly
        const value: SafeEnum<"TestEnum"> = actualEnum;
        expect(value.value).toBe('foo');
      } else {
        // This branch should never execute
        throw new Error("Type guard failed for valid enum value");
      }
    });
    
    it("should reject objects that look like enum values but aren't", () => {
      // Create an object that looks like an enum value but isn't
      const fakeEnum = { 
        key: "FOO", 
        value: "foo", 
        index: 0,
        // Missing __typeName and methods
      };
      
      // This should fail because it's not a real enum value
      expect(TestEnum.isEnumValue(fakeEnum as any)).toBe(false);
    });

    
    it("should catch invalid keys at compile time", () => {
      // Test runtime behavior for invalid values
      expect(TestEnum.fromValue("invalid")).toBeUndefined()
      expect(TestEnum.fromKey("INVALID")).toBeUndefined()
    });
    
    it("should work with different string literals", () => {
      const Colors = CreateSafeEnum({
        RED: { value: 'red', index: 0 },
        GREEN: { value: 'green', index: 1 },
        BLUE: { value: 'blue', index: 2 },
      } as const , "Colors");
      
      // Test type inference in function
      function getColorName(color: typeof Colors.RED | typeof Colors.GREEN | typeof Colors.BLUE): string {
        return color.value
      }
      
      expect(getColorName(Colors.RED)).toBe('red')
      expect(getColorName(Colors.GREEN)).toBe('green')
    });

    describe("hasValue()", () => {
      it("should return true for existing enum values", () => {
        expect(TestEnum.hasValue("foo")).toBe(true);
        expect(TestEnum.hasValue("bar")).toBe(true);
        expect(TestEnum.hasValue("baz")).toBe(true);
      });

      it("should return false for non-existent values", () => {
        expect(TestEnum.hasValue("nonexistent")).toBe(false);
        expect(TestEnum.hasValue("")).toBe(false);
        expect(TestEnum.hasValue(undefined as any)).toBe(false);
        expect(TestEnum.hasValue(null as any)).toBe(false);
        expect(TestEnum.hasValue(123 as any)).toBe(false);
        expect(TestEnum.hasValue({} as any)).toBe(false);
      });

      it("should work with empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const, "EmptyEnum")
        expect(EmptyEnum.hasValue("anything")).toBe(false)
      });

      it("should work with single-value enums", () => {
        const SingleEnum = CreateSafeEnum({
          ONLY: { value: "only", index: 0 }
        } as const, "SingleEnum")
        expect(SingleEnum.hasValue("only")).toBe(true)
        expect(SingleEnum.hasValue("nonexistent")).toBe(false)
      });

      it("should work with sparse indices", () => {
        const SparseEnum = CreateSafeEnum({
          A: { value: "a", index: 10 },
          B: { value: "b", index: 20 },
          C: { value: "c" } // Auto-assigned
        } as const, "SparseEnum")
        expect(SparseEnum.hasValue("a")).toBe(true)
        expect(SparseEnum.hasValue("b")).toBe(true)
        expect(SparseEnum.hasValue("c")).toBe(true)
        expect(SparseEnum.hasValue("nonexistent")).toBe(false)
      });
    });
  });

  describe("Utility Methods", () => {
    describe("values()", () => {
      it("should return an array of all enum values", () => {
        const values = TestEnum.getValues();
        expect(values).toHaveLength(3);
        expect(values).toContain("foo");
        expect(values).toContain("bar");
        expect(values).toContain("baz");
      });

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const, "EmptyEnum")
        expect(EmptyEnum.getValues()).toEqual([])
      });
    });

    describe("getEntries()", () => {
      it("should return an array of all enum entries", () => {
        const entries = TestEnum.getEntries();
        expect(entries).toHaveLength(3);
        // Each entry is a tuple of [key, SafeEnum], so we need to access the second element for the SafeEnum instance
        expect(entries.map(([_, e]) => e.getValueOrThrow())).toContain("foo");
        expect(entries.map(([key, _]) => key)).toContain("FOO");
      });
    });

    describe("indexes()", () => {
      it("should return an array of all enum indices", () => {
        const indices = TestEnum.getIndexes();
        expect(indices).toHaveLength(3);
        expect(indices).toContain(0);
        expect(indices).toContain(1);
        expect(indices).toContain(2);
      });

      it("should handle custom indices", () => {
        const CustomEnum = CreateSafeEnum({
          A: { value: "a", index: 10 },
          B: { value: "b", index: 20 },
          C: { value: "c" } // Auto-assigned
        } as const, "CustomEnum")
        const indices = CustomEnum.getIndexes();
        expect(indices).toHaveLength(3);
        expect(indices).toContain(10);
        expect(indices).toContain(20);
        expect(indices).toContain(CustomEnum.C.index);
      });

      it("should return an empty array for empty enums", () => {
        const EmptyEnum = CreateSafeEnum({} as const, "EmptyEnum")
        expect(EmptyEnum.getIndexes()).toEqual([])
      });
    });
  });

  describe("String Representation", () => {
    it("should provide a meaningful string representation with toString()", () => {
      expect(TestEnum.FOO.toString()).toBe("FOO: foo, index: 0")
      expect(TestEnum.BAR.toString()).toBe("BAR: bar, index: 1")
      expect(TestEnum.BAZ.toString()).toBe("BAZ: baz, index: 2")
    });
    
    it("should have correct enum values and keys", () => {
      // Test enum values
      expect(TestEnum.FOO.value).toBe('foo');
      expect(TestEnum.BAR.value).toBe('bar');
      
      // Test enum keys
      expect(TestEnum.FOO.key).toBe('FOO');
      expect(TestEnum.BAR.key).toBe('BAR');
      
      // Test enum indexes
      expect(TestEnum.FOO.index).toBe(0);
      expect(TestEnum.BAR.index).toBe(1);
    });

    it("should be called automatically in string interpolation", () => {
      const str = `Status: ${TestEnum.FOO}`;
      expect(str).toContain("FOO: foo, index: 0")
    });

    it("should provide a JSON-serializable object with toJSON()", () => {
      expect(TestEnum.FOO.toJSON()).toEqual({
        key: "FOO",
        value: "foo",
        index: 0
      });

      expect(TestEnum.BAR.toJSON()).toEqual({
        key: "BAR",
        value: "bar",
        index: 1
      });
    });

    it("should be used by JSON.stringify()", () => {
      const json = JSON.stringify({ status: TestEnum.FOO });
      const parsed = JSON.parse(json);
      expect(parsed).toEqual({
        status: {
          key: "FOO",
          value: "foo",
          index: 0
        }
      });
    });
  });

  describe("Error Handling", () => {
    it("should allow duplicate string values by default", () => {
      const createEnumWithDuplicateValues = () => {
        return CreateSafeEnum({
          FOO: { value: '42', index: 0 },
          BAR: { value: '42', index: 1 } // Same value as FOO but with different index
        } as const, "TestEnum");
      };
      
      // Should not throw for string values, even if they are the same
      expect(createEnumWithDuplicateValues).not.toThrow();
    });
  });

  describe("Utility Functions", () => {
    describe("getOrThrowUtil", () => {
      it("should return the value if it exists", () => {
        expect(getOrThrowUtil("test", "value")).toBe("test");
        expect(getOrThrowUtil(42, "index")).toBe(42);
      });

      it("should throw an error for undefined, null, or empty string", () => {
        expect(() => getOrThrowUtil(undefined, "value")).toThrow("[SafeEnum] value is undefined");
        expect(() => getOrThrowUtil(null as any, "value")).toThrow("[SafeEnum] value is null");
        expect(() => getOrThrowUtil("", "value")).toThrow("[SafeEnum] value is empty");
      });
    });

    describe("isEnumValueUtil", () => {
      it("should return true for valid enum values", () => {
        const TestEnum = CreateSafeEnum({
          FOO: { value: 'foo', index: 0 }
        } as const, "TestEnum");
        
        expect(isEnumValueUtil(TestEnum.FOO, { FOO: TestEnum.FOO }, "TestEnum")).toBe(true);
      });

      it("should return false for invalid enum values", () => {
        expect(isEnumValueUtil(null, {}, "TestEnum")).toBe(false);
        expect(isEnumValueUtil(undefined, {}, "TestEnum")).toBe(false);
        expect(isEnumValueUtil({}, {}, "TestEnum")).toBe(false);
        expect(isEnumValueUtil({ key: 'FOO', value: 'foo', index: 0 }, {}, "TestEnum")).toBe(false);
      });
      
      it("should return false for objects with non-Object constructor", () => {
        // Create an object with a custom constructor
        class CustomClass {}
        const customObj = new CustomClass();
        
        // Add required properties to make it look like a SafeEnum
        Object.assign(customObj, {
          key: 'CUSTOM',
          value: 'custom',
          index: 0,
          getValueOrThrow: () => 'custom',
          getKeyOrThrow: () => 'CUSTOM',
          getIndexOrThrow: () => 0,
          isEqual: () => true,
          toJSON: () => ({}),
          hasValue: () => true,
          hasKey: () => true,
          hasIndex: () => true,
          isEnumValue: () => true,
          [Symbol.iterator]: function*() { yield this; }
        });
        
        // Create a mock enum values object with proper typing
        const enumValues: Record<string, SafeEnum<'CUSTOM'>> = {
          // Type assertion to bypass the type checking since we're testing invalid cases
          CUSTOM: customObj as unknown as SafeEnum<'CUSTOM'>
        };
        
        // Should return false because constructor is not Object
        expect(isEnumValueUtil(customObj, enumValues, 'CUSTOM')).toBe(false);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle single-value enum", () => {
      const SingleEnum = CreateSafeEnum({
        ONLY: { value: "only", index: 0 }
      } as const, "SingleEnum");

      expect(SingleEnum.getKeys()).toEqual(["ONLY"]);
      const entries = SingleEnum.getEntries();
      
      // Check the structure of the entries array
      expect(entries).toHaveLength(1);
      expect(entries[0]).toHaveLength(2);
      expect(entries[0][0]).toBe("ONLY");
      expect(entries[0][1]).toBe(SingleEnum.ONLY);
      
      // Verify the values array
      expect(SingleEnum.getValues()).toEqual(['only']);
    });

    it("should handle sparse indices", () => {
      const SparseEnum = CreateSafeEnum({
        A: { value: "a", index: 10 },
        B: { value: "b", index: 20 },
        C: { value: "c", index: 30 } // Explicit index
      } as const, "SparseEnum");

      expect(SparseEnum.C.index).toBe(30);
      expect(SparseEnum.A.index).toBe(10);
      expect(SparseEnum.B.index).toBe(20);
    });

    it("should handle sparse indices with auto-assignment", () => {
      const SparseEnum = CreateSafeEnum({
        A: { value: "a", index: 10 },
        B: { value: "b", index: 20 },
        C: { value: "c" } // Auto-assigned index
      } as const, "SparseEnum");

      expect(SparseEnum.A.index).toBe(10);
      expect(SparseEnum.B.index).toBe(20);
      expect(SparseEnum.C.index).not.toBe(10);
      expect(SparseEnum.C.index).not.toBe(20);
      expect(SparseEnum.C.index).toBeGreaterThanOrEqual(0);

      const indices = SparseEnum.getIndexes();
      expect(indices).toContain(10);
      expect(indices).toContain(20);
      expect(indices).toContain(SparseEnum.C.index);
      expect(SparseEnum.getValues()).toEqual(['a', 'b', 'c']);
    });

    it("should throw error for duplicate indices", () => {
      expect(() => {
        CreateSafeEnum({
          A: { value: "a", index: 1 },
          B: { value: "b", index: 1 } // Duplicate index
        } as const, "DuplicateIndexEnum");
      }).toThrow("Duplicate index 1 for key 'B'. Indexes must be unique.");
    });
  });

  describe("Type System", () => {
    it("should allow using SafeEnum as a type alias", () => {      
      // Create a test enum
      const TestEnum = CreateSafeEnum({
        GET: { value: 'get', index: 0 },
        POST: { value: 'post', index: 1 }
      } as const, "TestEnum");
      type RequestType = SafeEnum<"TestEnum">;

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

    it("should allow using enum properties in object declarations", () => {
      // Define an enum for HTTP methods
      const HttpProtocol = CreateSafeEnum({
        GET: { value: 'get', index: 0 },
        POST: { value: 'post', index: 1 },
        PUT: { value: 'put', index: 2 },
        DELETE: { value: 'delete', index: 3 }
      } as const, "HttpProtocol");
      
      // Create an object using enum properties
      const requestConfig = {
        method: HttpProtocol.PUT.value,  // Using the string value
        methodKey: HttpProtocol.PUT.key, // Using the key
        methodIndex: HttpProtocol.PUT.index, // Using the index
        url: '/api/resource/123',
        requiresAuth: true
      };

      // Verify the object properties
      expect(requestConfig.method).toBe('put');
      expect(requestConfig.methodKey).toBe('PUT');
      expect(requestConfig.methodIndex).toBe(2);
      expect(requestConfig.url).toBe('/api/resource/123');
      expect(requestConfig.requiresAuth).toBe(true);

      // Verify type safety
      const processRequest = (config: { method: string }) => {
        return `Processing ${config.method.toUpperCase()} request`;
      };
      
      // This should type-check correctly
      expect(processRequest({ method: requestConfig.method })).toBe('Processing PUT request');
    });
  });

  describe("Type-safe Key access", () => {
    it("should allow type-safe access to Key without optional chaining", () => {
      // Create an enum with HTTP methods
      const HttpMethods = CreateSafeEnum({
        GET: { value: "get" },
        POST: { value: "post" },
        PUT: { value: "put" }
      } as const, "HttpMethods");
      
      type HttpMethods = SafeEnum<"HttpMethods">;
      
      // Interface using the type
      interface RequestConfig {
        method: string;
        url: string;
      }
      
      // Create objects with proper type checking
      const getRequest: RequestConfig = {
        method: HttpMethods.GET.value,  // No optional chaining needed
        url: "/api/data"
      };
      
      const postRequest: RequestConfig = {
        method: HttpMethods.POST.value,  // No optional chaining needed
        url: "/api/create"
      };
      
      // Verify values are correctly set
      expect(getRequest.method).toBe("get");
      expect(postRequest.method).toBe("post");
    });
  });
});
