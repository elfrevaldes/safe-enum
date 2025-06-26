import { describe, it, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { CreateSafeEnum } from './safe-enum-factory';
import type { SafeEnum } from './types/interfaces/safe-enum';

describe("CreateSafeEnum", () => {
  // Test enum setup
  const testEnumMap = {
    FOO: { value: 'foo', index: 0 },
    BAR: { value: 'bar', index: 1 },
    BAZ: { value: 'baz', index: 2 }
  } as const;
  
  type TestEnum = typeof testEnumMap;
  let testEnum: { [K in keyof TestEnum]: SafeEnum } & SafeEnum;
  
  // Setup before each test
  beforeEach(() => {
    testEnum = CreateSafeEnum(testEnumMap);
  });
  
  // Basic functionality
  describe("Basic Functionality", () => {
    it("should create enum with correct properties", () => {
      expect(testEnum.FOO).toBeDefined();
      expect(testEnum.BAR).toBeDefined();
      expect(testEnum.BAZ).toBeDefined();
      
      expect(testEnum.FOO.value).toBe('foo');
      expect(testEnum.FOO.key).toBe('FOO');
      expect(testEnum.FOO.index).toBe(0);
    });
    
    it("should ensure enum value properties are immutable", () => {
      // @ts-expect-error Testing immutability
      expect(() => { testEnum.FOO.value = 'new value'; }).toThrow();
      // @ts-expect-error Testing immutability
      expect(() => { testEnum.FOO.key = 'NEW_KEY'; }).toThrow();
      // @ts-expect-error Testing immutability
      expect(() => { testEnum.FOO.index = 999; }).toThrow();
    });
  });
  
  // Lookup methods
  describe("Lookup Methods", () => {
    describe("fromValue", () => {
      it("should find enum value by value", () => {
        expect(testEnum.fromValue('foo')).toBe(testEnum.FOO);
        expect(testEnum.fromValue('bar')).toBe(testEnum.BAR);
        expect(testEnum.fromValue('baz')).toBe(testEnum.BAZ);
        expect(testEnum.fromValue('nonexistent')).toBeUndefined();
      });
    });
    
    describe("fromKey", () => {
      it("should find enum value by key", () => {
        expect(testEnum.fromKey('FOO')).toBe(testEnum.FOO);
        expect(testEnum.fromKey('BAR')).toBe(testEnum.BAR);
        expect(testEnum.fromKey('BAZ')).toBe(testEnum.BAZ);
        expect(testEnum.fromKey('NONEXISTENT')).toBeUndefined();
      });
    });
    
    describe("fromIndex", () => {
      it("should find enum value by index", () => {
        expect(testEnum.fromIndex(0)).toBe(testEnum.FOO);
        expect(testEnum.fromIndex(1)).toBe(testEnum.BAR);
        expect(testEnum.fromIndex(2)).toBe(testEnum.BAZ);
        expect(testEnum.fromIndex(999)).toBeUndefined();
      });
    });
  });
  
  // Collection methods
  describe("Collection Methods", () => {
    it("should return all keys with keys()", () => {
      const keys = testEnum.keys();
      expect(keys).toEqual(['FOO', 'BAR', 'BAZ']);
    });
    
    it("should return all values with values()", () => {
      const values = testEnum.values();
      expect(values).toEqual(['foo', 'bar', 'baz']);
    });

    it("should return all indexes with indexes()", () => {
      const indexes = testEnum.indexes();
      expect(indexes).toEqual([0, 1, 2]);
    });
    
    it("should return all entries with entries()", () => {
      const entries = testEnum.entries();
      expect(entries).toHaveLength(3);
      expect(entries[0]).toEqual(['FOO', testEnum.FOO]);
      expect(entries[1]).toEqual(['BAR', testEnum.BAR]);
      expect(entries[2]).toEqual(['BAZ', testEnum.BAZ]);
    });
    
    it("should return all enum values with getEntries()", () => {
      const entries = testEnum.getEntries();
      expect(entries).toContain(testEnum.FOO);
      expect(entries).toContain(testEnum.BAR);
      expect(entries).toContain(testEnum.BAZ);
      expect(entries).toHaveLength(3);
    });
  });
  
  // Type safety
  describe("Type Guards", () => {
    it("should correctly identify enum values in isEnumValue", () => {
      const maybeEnum = testEnum.FOO;
      expect(testEnum.isEnumValue(maybeEnum)).toBe(true);
      expect(maybeEnum.value).toBe('foo');
    });
    
    it("should correctly identify non-enum values in isEnumValue", () => {
      // Test with null and undefined
      expect(testEnum.isEnumValue(null)).toBe(false);
      expect(testEnum.isEnumValue(undefined)).toBe(false);
      
      // Test with objects missing required properties
      expect(testEnum.isEnumValue({})).toBe(false);
      expect(testEnum.isEnumValue({ key: 'TEST' })).toBe(false);
      expect(testEnum.isEnumValue({ value: 'test' })).toBe(false);
      expect(testEnum.isEnumValue({ index: 0 })).toBe(false);
      
      // Test with objects with wrong types
      expect(testEnum.isEnumValue({ key: 1, value: 2, index: '3' })).toBe(false);
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
      expect(FalsyEnum.ZERO_STR.Value()).toBe('0');
      expect(FalsyEnum.FALSE_STR.Value()).toBe('false');
      expect(FalsyEnum.SPACE.Value()).toBe(' ');
      
      // Note: fromValue('0') will return ZERO_AS_STR because it was added last
      expect(FalsyEnum.fromValue('0')).toBe(FalsyEnum.ZERO_AS_STR);
      expect(FalsyEnum.fromValue('false')).toBe(FalsyEnum.FALSE_STR);
      expect(FalsyEnum.fromValue(' ')).toBe(FalsyEnum.SPACE);
      
      // Verify indices are handled correctly (non-zero)
      expect(FalsyEnum.ZERO_STR.Index()).toBe(1);
      expect(FalsyEnum.ZERO_AS_STR.Index()).toBe(4);
      expect(FalsyEnum.fromIndex(1)).toBe(FalsyEnum.ZERO_STR);
      expect(FalsyEnum.fromIndex(4)).toBe(FalsyEnum.ZERO_AS_STR);
    });
  });
  
  // Equality and comparison
  describe("Equality", () => {
    it("should correctly compare enum values", () => {
      expect(testEnum.FOO.isEqual(testEnum.FOO)).toBe(true);
      expect(testEnum.FOO.isEqual(testEnum.BAR)).toBe(false);
    });

    it("should correctly identify enum values in hasValue", () => {
      expect(testEnum.hasValue('foo')).toBe(true);
      expect(testEnum.hasValue('bar')).toBe(true);
      expect(testEnum.hasValue('baz')).toBe(true);
      expect(testEnum.hasValue('nonexistent')).toBe(false);
    });
    
    it("should correctly identify enum values in hasKey", () => {
      expect(testEnum.hasKey('FOO')).toBe(true);
      expect(testEnum.hasKey('BAR')).toBe(true);
      expect(testEnum.hasKey('BAZ')).toBe(true);
      expect(testEnum.hasKey('NONEXISTENT')).toBe(false);
    });
    
    it("should correctly identify enum values in hasIndex", () => {
      expect(testEnum.hasIndex(0)).toBe(true);
      expect(testEnum.hasIndex(1)).toBe(true);
      expect(testEnum.hasIndex(2)).toBe(true);
      expect(testEnum.hasIndex(100)).toBe(false);
    });

    it("should correctly compare different enums with isEqual", () => {
      const testEnum2 = CreateSafeEnum({
        SOME: { value: 'some', index: 0 },
        OTHER: { value: 'other', index: 1 },
        VALUES: { value: 'values', index: 2 }
      } as const);
      expect(testEnum.FOO.isEqual(testEnum2.SOME)).toBe(false);
      expect(testEnum.FOO.isEqual(testEnum2.OTHER)).toBe(false);
      expect(testEnum.FOO.isEqual(testEnum2.VALUES)).toBe(false);
    });
    
    it("should work with array of enums in isEqual", () => {
      expect(testEnum.FOO.isEqual([testEnum.FOO, testEnum.BAR])).toBe(true);
      expect(testEnum.FOO.isEqual([testEnum.BAR, testEnum.BAZ])).toBe(false);
    });
  });
  
  // String representation
  describe("String Representation", () => {
    it("should provide meaningful string representation", () => {
      const str = testEnum.FOO.toString();
      expect(str).toContain('FOO');
      expect(str).toContain('foo');
      expect(str).toContain('0');
    });
    
    it("should handle JSON serialization", () => {
      const json = JSON.stringify(testEnum.FOO);
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
      expect(EmptyEnum.keys()).toEqual([]);
      expect(EmptyEnum.values()).toEqual([]);
      expect(EmptyEnum.entries()).toEqual([]);
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
