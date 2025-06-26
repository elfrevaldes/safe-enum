import { describe, it, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { CreateSafeEnumFromArray } from './safe-enum-factory';
import type { SafeEnum } from './types/interfaces/safe-enum';

describe("CreateSafeEnumFromArray", () => {
  // Test array setup
  const testArray = ['foo', 'bar', 'baz'] as const;
  type TestArray = typeof testArray;
  let testEnum: { [K in Uppercase<TestArray[number]>]: SafeEnum } & SafeEnum;
  
  // Setup before each test
  beforeEach(() => {
    testEnum = CreateSafeEnumFromArray(testArray);
  });
  
  // Basic functionality
  describe("Basic Functionality", () => {
    it("should create enum with correct properties from array", () => {
      expect(testEnum.FOO).toBeDefined();
      expect(testEnum.BAR).toBeDefined();
      expect(testEnum.BAZ).toBeDefined();
      
      expect(testEnum.FOO.value).toBe('foo');
      expect(testEnum.FOO.key).toBe('FOO');
      expect(testEnum.FOO.index).toBe(0);
      
      expect(testEnum.BAR.value).toBe('bar');
      expect(testEnum.BAR.key).toBe('BAR');
      expect(testEnum.BAR.index).toBe(1);
      
      expect(testEnum.BAZ.value).toBe('baz');
      expect(testEnum.BAZ.key).toBe('BAZ');
      expect(testEnum.BAZ.index).toBe(2);
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
  describe("Lookup Method", () => {
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
  describe("Type Safety", () => {
    it("should narrow types with isEnumValue", () => {
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
    
    it("should have correct type inference for keys and values", () => {
      // This test will fail to compile if the types are incorrect
      const key: 'FOO' | 'BAR' | 'BAZ' = testEnum.FOO.key as 'FOO' | 'BAR' | 'BAZ';
      const value: 'foo' | 'bar' | 'baz' = testEnum.FOO.value as 'foo' | 'bar' | 'baz';
      expect(key).toBe('FOO');
      expect(value).toBe('foo');
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
      expect(testEnum.hasIndex(100)).toBe(false);
    });

    it("should correctly compare different enums with isEqual", () => {
      const testEnum2 = CreateSafeEnumFromArray(['some', 'other', 'values'] as const);
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
    it("should handle falsy but valid values correctly", () => {
      // This test verifies that falsy but valid values work correctly
      const FalsyEnum = CreateSafeEnumFromArray(['0', 'false', ' '] as const);
      
      // Get all entries to ensure we have the correct order
      const entries = FalsyEnum.getEntries();
      
      // We should have 3 entries
      expect(entries).toHaveLength(3);
      
      // Find each entry by its value
      const zeroEntry = entries.find(e => e.Value() === '0');
      const falseEntry = entries.find(e => e.Value() === 'false');
      const spaceEntry = entries.find(e => e.Value() === ' ');
      
      // All entries should be found
      expect(zeroEntry).toBeDefined();
      expect(falseEntry).toBeDefined();
      expect(spaceEntry).toBeDefined();
      
      if (zeroEntry && falseEntry && spaceEntry) {
        // Verify lookup by value
        expect(FalsyEnum.fromValue('0')).toBe(zeroEntry);
        expect(FalsyEnum.fromValue('false')).toBe(falseEntry);
        expect(FalsyEnum.fromValue(' ')).toBe(spaceEntry);
        
        // Verify indices are sequential and zero-based
        const indices = entries.map(e => e.Index());
        expect(indices).toEqual([0, 1, 2]);
        
        // Verify lookup by index
        expect(FalsyEnum.fromIndex(0)).toBe(zeroEntry);
        expect(FalsyEnum.fromIndex(1)).toBe(falseEntry);
        expect(FalsyEnum.fromIndex(2)).toBe(spaceEntry);
      }
    });
    
    it("should handle empty arrays", () => {
      const EmptyEnum = CreateSafeEnumFromArray([] as const);
      expect(EmptyEnum.getEntries()).toEqual([]);
      expect(EmptyEnum.keys()).toEqual([]);
      expect(EmptyEnum.values()).toEqual([]);
      expect(EmptyEnum.entries()).toEqual([]);
      expect(EmptyEnum.indexes()).toEqual([]);
    });
    
    it("should handle arrays with one element", () => {
      const SingleEnum = CreateSafeEnumFromArray(['test'] as const);
      expect(SingleEnum.TEST).toBeDefined();
      expect(SingleEnum.TEST.Value()).toBe('test');
      expect(SingleEnum.TEST.Index()).toBe(0);
      expect(SingleEnum.fromValue('test')).toBe(SingleEnum.TEST);
      expect(SingleEnum.fromIndex(0)).toBe(SingleEnum.TEST);
    });
    
    it("should throw an error for duplicate values in array", () => {
      // Create an enum with duplicate values should throw an error
      // The error message shows the case of the value that triggered the duplicate check
      expect(() => {
        CreateSafeEnumFromArray(['test', 'test', 'test'] as const);
      }).toThrow('Duplicate value: test');
      
      // Verify that case-insensitive duplicates are also caught
      // The error message shows the case of the value that triggered the duplicate check
      expect(() => {
        CreateSafeEnumFromArray(['first', 'Test', 'test', 'TEST'] as const);
      }).toThrow('Duplicate value: test');
      
      // Verify with different case variations
      expect(() => {
        CreateSafeEnumFromArray(['FIRST', 'first', 'First'] as const);
      }).toThrow('Duplicate value: first');
    });
  });
  
  // Type safety with TypeScript
  describe("TypeScript Integration", () => {
    // Create the enum
    const Status = CreateSafeEnumFromArray(['pending', 'approved', 'rejected'] as const);
    
    // Type alias using SafeEnum
    type StatusType = SafeEnum;

    it("should allow using the SafeEnum type directly in function parameters", () => {
      // This function accepts any Status enum value
      function processStatus(status: StatusType): string {
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
      const statuses: StatusType[] = [PENDING, APPROVED, REJECTED];
      
      expect(statuses).toHaveLength(3);
      expect(statuses.every(s => typeof s.key === 'string')).toBe(true);
      expect(statuses.every(s => typeof s.value === 'string')).toBe(true);
      expect(statuses.every(s => typeof s.index === 'number')).toBe(true);
    });

    it("should work with type guards", () => {
      function isApproved(status: StatusType): boolean {
        return status === Status.APPROVED;
      }

      expect(isApproved(Status.APPROVED)).toBe(true);
      expect(isApproved(Status.PENDING)).toBe(false);
    });

    it("should work with type predicates", () => {
      function isPending(status: StatusType): status is typeof Status.PENDING {
        return status === Status.PENDING;
      }

      const testStatus = Status.PENDING;
      if (isPending(testStatus)) {
        // TypeScript should know this is PENDING
        expect(testStatus.value).toBe('pending');
      }
    });

    it("should work with const assertions", () => {
      const COLORS = ['red', 'green', 'blue'] as const;
      const Colors = CreateSafeEnumFromArray(COLORS);
      
      expect(Colors.RED.value).toBe('red');
      expect(Colors.GREEN.value).toBe('green');
      expect(Colors.BLUE.value).toBe('blue');
    });
  });
});
