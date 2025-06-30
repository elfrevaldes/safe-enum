import { describe, it, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { CreateSafeEnum } from './safe-enum-factory';
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
  
  // Error handling
  describe("Error Handling", () => {
    it("should throw error for duplicate indices", () => {
      expect(() => {
        CreateSafeEnum({
          FOO: { value: 'foo', index: 1 },
          BAR: { value: 'bar', index: 1 } // Duplicate index
        });
      }).toThrow("Duplicate index");
    });
    
    // Note: The implementation requires the 'value' property to be provided
    // and does not default it to the key. This is the expected behavior.
    it("should handle missing properties with defaults", () => {
      // Test with missing index - should auto-index starting from 0
      const enumWithMissingIndex = CreateSafeEnum({
        FOO: { value: 'foo' },
        BAR: { value: 'bar' }
      });
      expect(enumWithMissingIndex.FOO.index).toBe(0);
      expect(enumWithMissingIndex.BAR.index).toBe(1);
      
      // Test with explicit indices
      const enumWithExplicitIndices = CreateSafeEnum({
        FOO: { value: 'foo', index: 10 },
        BAR: { value: 'bar', index: 20 }
      });
      expect(enumWithExplicitIndices.FOO.index).toBe(10);
      expect(enumWithExplicitIndices.BAR.index).toBe(20);
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
      // TypeScript should infer the correct type for destructured values
      const { PENDING, APPROVED, REJECTED } = Status;
      
      // These should all be of type SafeEnum
      const statuses: Status[] = [PENDING, APPROVED, REJECTED];
      
      expect(statuses).toHaveLength(3);
      expect(statuses.every(s => typeof s.key === 'string')).toBe(true);
      expect(statuses.every(s => typeof s.value === 'string')).toBe(true);
      expect(statuses.every(s => typeof s.index === 'number')).toBe(true);
    });

    it("should work with type guards", () => {
      function isApproved(status: Status): boolean {
        return status === Status.APPROVED;
      }

      expect(isApproved(Status.APPROVED)).toBe(true);
      expect(isApproved(Status.PENDING)).toBe(false);
    });

    it("should work with type predicates", () => {
      function isPending(status: Status): status is typeof Status.PENDING {
        return status === Status.PENDING;
      }

      const testStatus = Status.PENDING;
      if (isPending(testStatus)) {
        // TypeScript should know this is PENDING
        expect(testStatus.value).toBe('pending');
      }
    });
  });
});
