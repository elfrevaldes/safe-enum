import { describe, it, expect, beforeEach } from 'vitest';
import { createEnumValue, CreateSafeEnum, createErrorMessage, fullCompareUtil, getOrThrowUtil, isEnumValueUtil } from './safe-enum-factory';
import type { SafeEnum } from './types/interfaces/safe-enum';

describe("CreateSafeEnum", () => {
  // Test enum setup
  const TestEnumMap = {
    FOO: { value: 'foo', index: 0 },
    BAR: { value: 'bar', index: 1 },
    BAZ: { value: 'baz', index: 2 }
  } as const;
  
  // Create the enum with uppercase name
  const TestEnum = CreateSafeEnum(TestEnumMap);
  
  // Type alias for the enum values with matching name
  type TestEnum = SafeEnum;
  
  // Basic functionality
  describe("Basic Functionality", () => {
    it("should create an enum with the correct values", () => {
      expect(TestEnum.FOO.value).toBe('foo');
      expect(TestEnum.BAR.value).toBe('bar');
      expect(TestEnum.BAZ.value).toBe('baz');
    });

    it("should have the correct keys", () => {
      const keys = Object.keys(TestEnum).filter(k => !['Type', 'fromValue', 'fromKey', 'fromIndex', 'keys', 'values', 'entries', 'hasValue', 'hasKey', 'hasIndex'].includes(k));
      expect(keys).toEqual(expect.arrayContaining(['FOO', 'BAR', 'BAZ']));
    });

    it("should have the correct values", () => {
      const values = Object.values(TestEnum)
        .filter((v): v is SafeEnum => typeof v === 'object' && v !== null && 'value' in v)
        .map(v => v.value);
      expect(values).toEqual(expect.arrayContaining(['foo', 'bar', 'baz']));
    });

    it("should ensure enum value properties are immutable", () => {
      // @ts-expect-error Testing immutability
      expect(() => { TestEnum.FOO.value = 'new value'; }).toThrow();
      // @ts-expect-error Testing immutability
      expect(() => { TestEnum.FOO.value = 'new value'; }).toThrow();
      // @ts-expect-error Testing immutability
      expect(() => { TestEnum.FOO.key = 'NEW_KEY'; }).toThrow();
      // @ts-expect-error Testing immutability
      expect(() => { TestEnum.FOO.index = 999; }).toThrow();
    });

    describe("Should instantiate enum from values", () => {
      it("fromValue should return the correct enum value", () => {
        expect(TestEnum.fromValue('foo')).toBe(TestEnum.FOO);
        expect(TestEnum.fromValue('bar')).toBe(TestEnum.BAR);
        expect(TestEnum.fromValue('baz')).toBe(TestEnum.BAZ);
      });

      it("fromKey should return the correct enum value", () => {
        expect(TestEnum.fromKey('FOO')).toBe(TestEnum.FOO);
        expect(TestEnum.fromKey('BAR')).toBe(TestEnum.BAR);
        expect(TestEnum.fromKey('BAZ')).toBe(TestEnum.BAZ);
      });

      it("fromIndex should return the correct enum value", () => {
        expect(TestEnum.fromIndex(0)).toBe(TestEnum.FOO);
        expect(TestEnum.fromIndex(1)).toBe(TestEnum.BAR);
        expect(TestEnum.fromIndex(2)).toBe(TestEnum.BAZ);
      });
    });
  });
  
  // Lookup methods
  describe("Lookup Methods", () => {
    describe("fromValue", () => {
      it('should have static lookup methods', () => {
        // Test fromValue
        expect(TestEnum.fromValue('foo')?.value).toBe('foo');
        
        // Test fromKey
        expect(TestEnum.fromKey('FOO')?.value).toBe('foo');
        
        // Test fromIndex
        expect(TestEnum.fromIndex(0)?.value).toBe('foo');
      });  
      it("should find enum value by value", () => {
        expect(TestEnum.fromValue('foo')).toBe(TestEnum.FOO);
        expect(TestEnum.fromValue('bar')).toBe(TestEnum.BAR);
        expect(TestEnum.fromValue('baz')).toBe(TestEnum.BAZ);
        expect(TestEnum.fromValue('nonexistent')).toBeUndefined();
      });
    });
    
    describe("fromKey", () => {
      it("should find enum value by key", () => {
        expect(TestEnum.fromKey('FOO')).toBe(TestEnum.FOO);
        expect(TestEnum.fromKey('BAR')).toBe(TestEnum.BAR);
        expect(TestEnum.fromKey('BAZ')).toBe(TestEnum.BAZ);
        expect(TestEnum.fromKey('NONEXISTENT')).toBeUndefined();
      });
    });
    
    describe("fromIndex", () => {
      it("should find enum value by index", () => {
        expect(TestEnum.fromIndex(0)).toBe(TestEnum.FOO);
        expect(TestEnum.fromIndex(1)).toBe(TestEnum.BAR);
        expect(TestEnum.fromIndex(2)).toBe(TestEnum.BAZ);
        expect(TestEnum.fromIndex(999)).toBeUndefined();
      });
    });
  });
  
  // Accessors Methods
  describe("Accessors Methods", () => {
    describe("with valid properties", () => {
      it("Value() should return the value", () => {
        expect(TestEnum.FOO.getValueOrThrow()).toBe('foo');
        expect(TestEnum.BAR.getValueOrThrow()).toBe('bar');
        expect(TestEnum.BAZ.getValueOrThrow()).toBe('baz');
      });  
      it("should have correct instance methods", () => {
        const value = TestEnum.FOO;
        
        // Test Value() method
        expect(value.getValueOrThrow()).toBe('foo');
        
        // Test Key() method
        expect(value.getKeyOrThrow()).toBe('FOO');
        
        // Test Index() method
        expect(value.getIndexOrThrow()).toBe(0);
      });  
      it("Key() should return the key", () => {
        expect(TestEnum.FOO.getKeyOrThrow()).toBe('FOO');
        expect(TestEnum.BAR.getKeyOrThrow()).toBe('BAR');
        expect(TestEnum.BAZ.getKeyOrThrow()).toBe('BAZ');
      });
    
      it("Index() should return the index", () => {
        expect(TestEnum.FOO.getIndexOrThrow()).toBe(0);
        expect(TestEnum.BAR.getIndexOrThrow()).toBe(1);
        expect(TestEnum.BAZ.getIndexOrThrow()).toBe(2);
      });
    });
    
    describe("validation during creation", () => {
      it("should throw when creating an enum with empty string value", () => {
        expect(() => {
          CreateSafeEnum({
            TEST: { value: '', index: 0 }
          });
        }).toThrow('Enum value cannot be an empty string for key: TEST');
      });

      it("should throw when creating an enum with negative index", () => {
        expect(() => {
          CreateSafeEnum({
            TEST: { value: 'test', index: -1 }
          });
        }).toThrow('Enum index cannot be less than zero for key: TEST');
      });

      it("should throw when creating an enum with empty string key", () => {
        expect(() => {
          // This is a TypeScript error, but we need to test the runtime behavior
          const _: any = { '': { value: 'test', index: 0 } };
          CreateSafeEnum(_);
        }).toThrow('Enum key cannot be an empty string for value: test');
      });
    });
    describe("accessing undefined properties", () => {
      it("Key() should throw an error when accessing undefined properties", () => {
        const invalidKey = (TestEnum as any).INVALIDKEY as SafeEnum | undefined;
        expect(invalidKey).toBeUndefined();
        
        // Test that trying to call Key() on undefined throws
        expect(() => (invalidKey as any).Key()).toThrow(TypeError);
      });
      it("Value() should throw an error when accessing undefined properties", () => {
        const invalidKey = (TestEnum as any).INVALIDKEY as SafeEnum | undefined;
        expect(invalidKey).toBeUndefined();
          
        // Test that trying to call Value() on undefined throws
        expect(() => (invalidKey as any).Value()).toThrow(TypeError);
      });
      it("Index() should throw an error when accessing undefined properties", () => {
        const invalidKey = (TestEnum as any).INVALIDKEY as SafeEnum | undefined;
        expect(invalidKey).toBeUndefined();
          
        // Test that trying to call Index() on undefined throws
        expect(() => (invalidKey as any).Index()).toThrow(TypeError);
      });
    });
  });
    
  // Collection methods
  describe("Collection Methods", () => {
    it("should return all keys with keys()", () => {
      const keys = TestEnum.getKeys();
      expect(keys).toEqual(['FOO', 'BAR', 'BAZ']);
    });
    
    it("should return all values with values()", () => {
      const values = TestEnum.getValues();
      expect(values).toEqual(['foo', 'bar', 'baz']);
    });

    it("should return all indexes with indexes()", () => {
      const indexes = TestEnum.getIndexes();
      expect(indexes).toEqual([0, 1, 2]);
    });
    
    it("should return all entries with entries()", () => {
      const entries = TestEnum.getEntries();
      expect(entries).toHaveLength(3);
      expect(entries[0]).toEqual(['FOO', TestEnum.FOO]);
      expect(entries[1]).toEqual(['BAR', TestEnum.BAR]);
      expect(entries[2]).toEqual(['BAZ', TestEnum.BAZ]);
    });
    
    it("should return all enum entries as [key, value] tuples with getEntries()", () => {
      const entries = TestEnum.getEntries();
      // Check that entries contains the expected tuples
      expect(entries).toContainEqual(['FOO', TestEnum.FOO]);
      expect(entries).toContainEqual(['BAR', TestEnum.BAR]);
      expect(entries).toContainEqual(['BAZ', TestEnum.BAZ]);
      expect(entries).toHaveLength(3);
    });
  });
  
  // Type safety
  describe("Static Methods", () => {
    describe("isEqual", () => {
      it("should return true when all values are the same", () => {
        expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.FOO])).toBe(true);
        expect(TestEnum.isEqual([TestEnum.BAR, TestEnum.BAR])).toBe(true);
      });
      
      it("should return false when values are different", () => {
        expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(false);
        expect(TestEnum.isEqual([TestEnum.BAR, TestEnum.BAZ])).toBe(false);
      });
      
      it("should work with arrays of enum values", () => {
        expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.BAR, TestEnum.FOO, TestEnum.BAR])).toBe(false);
        expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.FOO])).toBe(true);
      });
      
      it("should return false for null or undefined values", () => {
        expect(TestEnum.isEqual([null as any])).toBe(false);
        expect(TestEnum.isEqual([undefined as any])).toBe(false);
      });
      
      it("should return true for a single fake enum value (since it has all required methods)", () => {
        // Create a plain object that looks like a SafeEnum but isn't one
        const fakeEnum = { 
          value: 'foo', 
          key: 'FOO', 
          index: 0,
          // These methods will be called by isEqual
          getValueOrThrow: () => 'foo',
          getKeyOrThrow: () => 'FOO',
          getIndexOrThrow: () => 0
        };
        // Since the object has all the required methods, isEqual will return true
        expect(TestEnum.isEqual([fakeEnum as any])).toBe(true);
      });
      
      it("should handle single value comparison", () => {
        expect(TestEnum.isEqual([TestEnum.FOO])).toBe(true);
      });
    });
    
    describe("Collection Methods", () => {
      it("should return all keys with getKeys()", () => {
        const keys = TestEnum.getKeys();
        expect(keys).toContain('FOO');
        expect(keys).toContain('BAR');
        expect(keys).toContain('BAZ');
        expect(keys).toHaveLength(3);
      });
      
      it("should return all values with getValues()", () => {
        const values = TestEnum.getValues();
        expect(values).toContain('foo');
        expect(values).toContain('bar');
        expect(values).toContain('baz');
        expect(values).toHaveLength(3);
      });
      
      it("should return all indexes with getIndexes()", () => {
        const indexes = TestEnum.getIndexes();
        expect(indexes).toContain(0);
        expect(indexes).toContain(1);
        expect(indexes).toContain(2);
        expect(indexes).toHaveLength(3);
      });
      
      it("should return all entries with getEntries()", () => {
        const entries = TestEnum.getEntries();
        expect(entries).toContainEqual(['FOO', TestEnum.FOO]);
        expect(entries).toContainEqual(['BAR', TestEnum.BAR]);
        expect(entries).toContainEqual(['BAZ', TestEnum.BAZ]);
        expect(entries).toHaveLength(3);
      });
      
      it("should be iterable with for...of", () => {
        const values = [];
        for (const value of TestEnum) {
          values.push(value);
        }
        expect(values).toContain(TestEnum.FOO);
        expect(values).toContain(TestEnum.BAR);
        expect(values).toContain(TestEnum.BAZ);
        expect(values).toHaveLength(3);
      });
    });
  });

  describe("Type Guards", () => {
    it("should correctly identify enum values in isEnumValue", () => {
      const maybeEnum = TestEnum.FOO;
      expect(TestEnum.isEnumValue(maybeEnum)).toBe(true);
      expect(maybeEnum.value).toBe('foo');
    });
    
    it("should correctly identify non-enum values in isEnumValue", () => {
      // Test with null and undefined
      expect(TestEnum.isEnumValue(null)).toBe(false);
      expect(TestEnum.isEnumValue(undefined)).toBe(false);
      
      // Test with objects missing required properties
      expect(TestEnum.isEnumValue({})).toBe(false);
      expect(TestEnum.isEnumValue({ key: 'TEST' })).toBe(false);
      expect(TestEnum.isEnumValue({ value: 'test' })).toBe(false);
      expect(TestEnum.isEnumValue({ index: 0 })).toBe(false);
      
      // Test with objects with wrong types
      expect(TestEnum.isEnumValue({ key: 1, value: 2, index: '3' })).toBe(false);
    });
    
    it("should throw when value is an empty string", () => {
      // The implementation doesn't allow empty string values
      const createWithEmptyString = () => {
        return CreateSafeEnum({
          EMPTY: { value: '', index: 1 }
        });
      };
      
      expect(createWithEmptyString).toThrow();
    });
    
    it("should throw when index is less than zero", () => {
      // The implementation throws for negative indices
      const createWithNegativeIndex = () => {
        return CreateSafeEnum({
          NEGATIVE: { value: 'negative', index: -1 }
        });
      };
      
      expect(createWithNegativeIndex).toThrow();
    });
    
    it("should handle falsy but valid values correctly", () => {
      // This test verifies that falsy but valid values work correctly
      const FalsyEnum = CreateSafeEnum({
        ZERO_STR: { value: '0', index: 1 },
        FALSE_STR: { value: 'false', index: 2 },
        SPACE: { value: ' ', index: 3 },
        ZERO_AS_STR: { value: '0', index: 4 } // Note: This will overwrite ZERO_STR in the value map
      });
      
      // '0' is falsy but valid as a string
      expect(FalsyEnum.ZERO_STR.getValueOrThrow()).toBe('0');
      expect(FalsyEnum.FALSE_STR.getValueOrThrow()).toBe('false');
      expect(FalsyEnum.SPACE.getValueOrThrow()).toBe(' ');
      
      // Note: fromValue('0') will return ZERO_AS_STR because it was added last
      expect(FalsyEnum.fromValue('0')).toBe(FalsyEnum.ZERO_AS_STR);
      expect(FalsyEnum.fromValue('false')).toBe(FalsyEnum.FALSE_STR);
      expect(FalsyEnum.fromValue(' ')).toBe(FalsyEnum.SPACE);
      
      // Verify indices are handled correctly (non-zero)
      expect(FalsyEnum.ZERO_STR.getIndexOrThrow()).toBe(1);
      expect(FalsyEnum.ZERO_AS_STR.getIndexOrThrow()).toBe(4);
      expect(FalsyEnum.fromIndex(1)).toBe(FalsyEnum.ZERO_STR);
      expect(FalsyEnum.fromIndex(4)).toBe(FalsyEnum.ZERO_AS_STR);
    });
  });
  
  // Equality and comparison
  describe("Equality", () => {
    it("should correctly compare enum values", () => {
      expect(TestEnum.FOO.isEqual(TestEnum.FOO)).toBe(true);
      expect(TestEnum.FOO.isEqual(TestEnum.BAR)).toBe(false);
      
      // Test with arrays
      expect(TestEnum.FOO.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(true);
      expect(TestEnum.FOO.isEqual([TestEnum.BAR, TestEnum.BAZ])).toBe(false);
      
      // Test with null/undefined
      expect(TestEnum.FOO.isEqual(null as any)).toBe(false);
      expect(TestEnum.FOO.isEqual(undefined as any)).toBe(false);
      
      // Test static isEqual
      expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.FOO])).toBe(true);
      expect(TestEnum.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(false);
      expect(TestEnum.isEqual([])).toBe(false);
      expect(TestEnum.isEqual(null as any)).toBe(false);
      expect(TestEnum.isEqual(undefined as any)).toBe(false);
    });
    
    it("should handle hasValue and hasKey with invalid inputs", () => {
      expect(TestEnum.hasValue(null as any)).toBe(false);
      expect(TestEnum.hasValue(undefined as any)).toBe(false);
      expect(TestEnum.hasKey('NONEXISTENT')).toBe(false);
    });
    
    it("should correctly identify enum values in hasIndex", () => {
      expect(TestEnum.hasIndex(0)).toBe(true);
      expect(TestEnum.hasIndex(1)).toBe(true);
      expect(TestEnum.hasIndex(2)).toBe(true);
      expect(TestEnum.hasIndex(100)).toBe(false);
    });

    it("should correctly compare different enums with isEqual", () => {
      const TestEnum2 = CreateSafeEnum({
        SOME: { value: 'some', index: 0 },
        OTHER: { value: 'other', index: 1 },
        VALUES: { value: 'values', index: 2 }
      } as const);
      expect(TestEnum.FOO.isEqual(TestEnum2.SOME)).toBe(false);
      expect(TestEnum.FOO.isEqual(TestEnum2.OTHER)).toBe(false);
      expect(TestEnum.FOO.isEqual(TestEnum2.VALUES)).toBe(false);
    });
    
    it("should work with array of enums in isEqual", () => {
      expect(TestEnum.FOO.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(true);
      expect(TestEnum.FOO.isEqual([TestEnum.BAR, TestEnum.BAZ])).toBe(false);
    });
  });

  // String representation
  describe("String Representation", () => {
    it("should provide meaningful string representation", () => {
      const str = TestEnum.FOO.toString();
      expect(str).toContain('FOO');
      expect(str).toContain('foo');
      expect(str).toContain('0');
    });

    it("should handle JSON serialization", () => {
      const json = JSON.stringify(TestEnum.FOO);
      const parsed = JSON.parse(json);
      expect(parsed.key).toBe('FOO');
      expect(parsed.value).toBe('foo');
      expect(parsed.index).toBe(0);
    });
  });
  
  // Edge cases
  describe("Edge Cases", () => {
    it("should handle empty enum object", () => {
      const EmptyEnum = CreateSafeEnum({});
      expect(EmptyEnum.getKeys()).toEqual([]);
      expect(EmptyEnum.getValues()).toEqual([]);
      expect(EmptyEnum.getEntries()).toEqual([]);
    });
    
    it("should handle custom indices", () => {
      const CustomEnum = CreateSafeEnum({
        FOO: { value: 'foo', index: 10 },
        BAR: { value: 'bar', index: 20 },
        BAZ: { value: 'baz' } // Auto-indexed
      });

      expect(CustomEnum.FOO.index).toBe(10);
      expect(CustomEnum.BAR.index).toBe(20);
      expect(CustomEnum.BAZ.index).toBeGreaterThanOrEqual(0);
    });
  });
  
  // Type safety with TypeScript
  describe("TypeScript Integration", () => {
    // Create the enum
    const Status = CreateSafeEnum({
      PENDING: { value: 'pending', index: 0 },
      APPROVED: { value: 'approved', index: 1 },
      REJECTED: { value: 'rejected', index: 2 }
    });

    // Type alias using SafeEnum
    type Status = SafeEnum;

    it("should allow using the SafeEnum type directly in function parameters", () => {
      // This function accepts any Status enum value
      function processStatus(status: Status): string {
        return `Processing: ${status.value}`;
      }

      // All status values should be accepted
      expect(processStatus(Status.PENDING)).toBe('Processing: pending');
      expect(processStatus(Status.APPROVED)).toBe('Processing: approved');
      expect(processStatus(Status.REJECTED)).toBe('Processing: rejected');
    });

    it("should provide proper type inference for enum values", () => {
      // This test is for TypeScript type checking
      const status: typeof TestEnum = TestEnum;
      const value: SafeEnum = TestEnum.FOO;
      
      // This should not cause a TypeScript error
      expect(status.FOO).toBe(TestEnum.FOO);
      expect(value).toBe(TestEnum.FOO);
    });
    
    it("should correctly identify enum values with isEnumValue", () => {
      // Test with valid enum value
      expect(TestEnum.isEnumValue(TestEnum.FOO)).toBe(true);
      
      // Test with non-enum object that has similar structure
      // Note: isEnumValue will return true for objects with the same shape and key
      // as a real enum value, since it checks shape and key existence
      const fakeEnum = {
        value: 'fake',
        key: 'NON_EXISTENT_KEY',
        index: 999,
        getValueOrThrow: () => 'fake',
        getKeyOrThrow: () => 'NON_EXISTENT_KEY',
        getIndexOrThrow: () => 999
      };
      // This will be false because the key doesn't exist in the enum values
      expect(TestEnum.isEnumValue(fakeEnum)).toBe(false);
      
      // Test with null or undefined
      expect(TestEnum.isEnumValue(null)).toBe(false);
      expect(TestEnum.isEnumValue(undefined)).toBe(false);
      
      // Test with primitive values
      expect(TestEnum.isEnumValue('string')).toBe(false);
      expect(TestEnum.isEnumValue(123)).toBe(false);
      expect(TestEnum.isEnumValue(true)).toBe(false);
    });
    
    it("should throw errors for invalid values in getter methods", () => {
      // Test getOrThrowUtil with empty string which is falsy
      expect(() => getOrThrowUtil('', 'test')).toThrow("No enum value with key 'test'");
      
      // Test with 0 which is falsy but valid for numbers
      expect(getOrThrowUtil(0, 'test')).toBe(0);
      
      // Test with valid values to ensure they return correctly
      expect(getOrThrowUtil('valid', 'test')).toBe('valid');
      expect(getOrThrowUtil(42, 'test')).toBe(42);
    });
  
    it("should work with array of enums in isEqual", () => {
      expect(TestEnum.FOO.isEqual([TestEnum.FOO, TestEnum.BAR])).toBe(true);
        expect(TestEnum.FOO.isEqual([TestEnum.BAR, TestEnum.BAZ])).toBe(false);
      });
  });

  describe("export methods", () => {
    const enumValues: Record<string, SafeEnum> = {}
    const enumValue = createEnumValue('FOO', 'foo', 0, enumValues);

    it("isEnumValueUtil should return false for invalid enum values", () => {
      expect(isEnumValueUtil(enumValue, enumValues)).toBe(false);
    });

    it("getOrThrowUtil should throw an error for invalid enum values", () => {
      expect(() => getOrThrowUtil(undefined, 'test')).toThrow("No enum value with key 'test'");
    });

    it("fullCompareUtil should return true for valid enum values", () => {
      expect(fullCompareUtil(enumValue, enumValue)).toBe(true);
    });

    describe("createErrorMessage", () => {
      let keyToEntry: Map<string, any>;
      let valueToEntry: Map<string, any>;
      let indexToEntry: Map<number, any>;

      // Setup test data before each test
      beforeEach(() => {
        // Create test data
        const testEntry = { key: 'TEST', value: 'test', index: 1 };
        keyToEntry = new Map([['TEST', testEntry]]);
        valueToEntry = new Map([['test', testEntry]]);
        indexToEntry = new Map([[1, testEntry]]);
      });

      it("should create error message for missing value", () => {
        const errorMessage = createErrorMessage(
          'value', 
          'missing', 
          keyToEntry, 
          valueToEntry, 
          indexToEntry
        );
        expect(errorMessage).toBe("[SafeEnum] No enum value with value 'missing'. Valid values are: 'test'");
      });

      it("should create error message for missing key", () => {
        const errorMessage = createErrorMessage(
          'key', 
          'MISSING', 
          keyToEntry, 
          valueToEntry, 
          indexToEntry
        );
        expect(errorMessage).toBe("[SafeEnum] No enum value with key 'MISSING'. Valid keys are: 'TEST'");
      });

      it("should create error message for missing index", () => {
        const errorMessage = createErrorMessage(
          'index', 
          999, 
          keyToEntry, 
          valueToEntry, 
          indexToEntry
        );
        expect(errorMessage).toBe("[SafeEnum] No enum value with index 999. Valid indices are: 'TEST': 1");
      });

      it("should handle empty maps gracefully", () => {
        const emptyMap = new Map();
        const errorMessage = createErrorMessage(
          'key', 
          'MISSING', 
          emptyMap, 
          emptyMap, 
          emptyMap
        );
        expect(errorMessage).toBe("[SafeEnum] No enum value with key 'MISSING'. Valid keys are: ");
      });
    });
  });
});
