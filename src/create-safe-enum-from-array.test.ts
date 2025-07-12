import { describe, it, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { CreateSafeEnumFromArray } from './safe-enum-factory';
import type { SafeEnum } from './types/interfaces/safe-enum';

// Mock console.error to avoid polluting test output
let mockConsoleError: any;
beforeAll(() => {
  mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { /* intentionally empty for test */ });
});

describe("CreateSafeEnumFromArray", () => {
  // Test array setup
  const testArray = ['foo', 'bar', 'baz'] as const;
  let TestEnum = CreateSafeEnumFromArray(testArray, "TestEnum");
  type TestEnum = SafeEnum<"TestEnum">;
  // Setup before each test
  beforeEach(() => {
    TestEnum = CreateSafeEnumFromArray(testArray, "TestEnum");
  });
  
  // Basic functionality
  describe("Basic Functionality", () => {
    it("should create enum with correct properties from array", () => {
      expect(TestEnum.FOO).toBeDefined();
      expect(TestEnum.BAR).toBeDefined();
      expect(TestEnum.BAZ).toBeDefined();
      
      expect(TestEnum.FOO.value).toBe('foo');
      expect(TestEnum.FOO.key).toBe('FOO');
      expect(TestEnum.FOO.index).toBe(0);
      
      expect(TestEnum.BAR.value).toBe('bar');
      expect(TestEnum.BAR.key).toBe('BAR');
      expect(TestEnum.BAR.index).toBe(1);
      
      expect(TestEnum.BAZ.value).toBe('baz');
      expect(TestEnum.BAZ.key).toBe('BAZ');
      expect(TestEnum.BAZ.index).toBe(2);
    });
    
    it("should ensure enum value properties are immutable", () => {
      // @ts-expect-error Testing immutability
      expect(() => { TestEnum.FOO.value = 'new value'; }).toThrow();
      // @ts-expect-error Testing immutability
      expect(() => { TestEnum.FOO.key = 'NEW_KEY'; }).toThrow();
      // @ts-expect-error Testing immutability
      expect(() => { TestEnum.FOO.index = 999; }).toThrow();
    });
  });
  
  // Lookup methods
  describe("Lookup Method", () => {
    describe("fromValue", () => {
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
  
  describe("Accessors Methods", () => {
    describe("with valid properties", () => {
      it("Value()should return the value", () => {
        expect(TestEnum.FOO.getValueOrThrow()).toBe('foo');
        expect(TestEnum.BAR.getValueOrThrow()).toBe('bar');
        expect(TestEnum.BAZ.getValueOrThrow()).toBe('baz');
      });
    
      it("Key()should return the key", () => {
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
    describe("accessing undefined properties", () => {
      it("Key() should throw an error when accessing undefined properties", () => {
        const invalidKey = (TestEnum as any).INVALIDKEY as SafeEnum<"TestEnum"> | undefined;
        expect(invalidKey).toBeUndefined();
        
        // Test that trying to call Key() on undefined throws
        expect(() => (invalidKey as any).Key()).toThrow(TypeError);
      });
      it("Value() should throw an error when accessing undefined properties", () => {
        const invalidKey = (TestEnum as any).INVALIDKEY as SafeEnum<"TestEnum"> | undefined;
        expect(invalidKey).toBeUndefined();
          
        // Test that trying to call Value() on undefined throws
        expect(() => (invalidKey as any).Value()).toThrow(TypeError);
      });
      it("Index() should throw an error when accessing undefined properties", () => {
        const invalidKey = (TestEnum as any).INVALIDKEY as SafeEnum<"TestEnum"> | undefined;
        expect(invalidKey).toBeUndefined();
          
        // Test that trying to call Index() on undefined throws
        expect(() => (invalidKey as any).Index()).toThrow(TypeError);
      });
    });
  });

  // Collection methods
  describe("Collection Methods", () => {
    it("should return all keys with getKeys()", () => {
      const keys = TestEnum.getKeys();
      expect(keys).toEqual(['FOO', 'BAR', 'BAZ']);
    });
    
    it("should return all values with getValues()", () => {
      const values = TestEnum.getValues();
      expect(values).toEqual(['foo', 'bar', 'baz']);
    });
    
    it("should return all indexes with getIndexes()", () => {
      const indexes = TestEnum.getIndexes();
      expect(indexes).toEqual([0, 1, 2]);
    });

    it("should return all entries with getEntries()", () => {
      const entries = TestEnum.getEntries();
      expect(entries).toHaveLength(3);
      expect(entries[0]).toEqual(['FOO', TestEnum.FOO]);
      expect(entries[1]).toEqual(['BAR', TestEnum.BAR]);
      expect(entries[2]).toEqual(['BAZ', TestEnum.BAZ]);
    });
  });
  
  // Type safety
  describe("Type Safety", () => {
    it("should narrow types with isEnumValue", () => {
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
    
    it("should have correct type inference for keys and values", () => {
      // This test will fail to compile if the types are incorrect
      const key: 'FOO' | 'BAR' | 'BAZ' = TestEnum.FOO.key as 'FOO' | 'BAR' | 'BAZ';
      const value: 'foo' | 'bar' | 'baz' = TestEnum.FOO.value as 'foo' | 'bar' | 'baz';
      expect(key).toBe('FOO');
      expect(value).toBe('foo');
    });
  });
  
  // Equality and comparison
  describe("Equality", () => {
    it("should correctly compare enum values", () => {
      expect(TestEnum.FOO.isEqual(TestEnum.FOO)).toBe(true);
      expect(TestEnum.FOO.isEqual(TestEnum.BAR)).toBe(false);
    });

    it("should correctly identify enum values in hasValue", () => {
      expect(TestEnum.hasValue('foo')).toBe(true);
      expect(TestEnum.hasValue('bar')).toBe(true);
      expect(TestEnum.hasValue('baz')).toBe(true);
      expect(TestEnum.hasValue('nonexistent')).toBe(false);
    });
    
    it("should correctly identify enum values in hasKey", () => {
      expect(TestEnum.hasKey('FOO')).toBe(true);
      expect(TestEnum.hasKey('BAR')).toBe(true);
      expect(TestEnum.hasKey('BAZ')).toBe(true);
      expect(TestEnum.hasKey('NONEXISTENT')).toBe(false);
    });
    
    it("should correctly identify enum values in hasIndex", () => {
      expect(TestEnum.hasIndex(0)).toBe(true);
      expect(TestEnum.hasIndex(1)).toBe(true);
      expect(TestEnum.hasIndex(100)).toBe(false);
    });

    it("should correctly compare different enums with isEqual", () => {
      const TestEnum2 = CreateSafeEnumFromArray(['some', 'other', 'values'] as const, "TestEnum2");
      expect(TestEnum2.SOME.isEqual(TestEnum2.SOME)).toBe(true);
      expect(TestEnum2.SOME.isEqual(TestEnum2.OTHER)).toBe(false);
      expect(TestEnum2.SOME.isEqual(TestEnum2.VALUES)).toBe(false);
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
  describe("Validation", () => {
    it("should throw when array contains empty strings", () => {
      expect(() => {
        CreateSafeEnumFromArray(['', 'Something', 'Else'] as const, "TestEnum");
      }).toThrow('[SafeEnum] Key cannot be empty');
    });

    it("should throw when array contains duplicate values", () => {
      expect(() => {
        CreateSafeEnumFromArray(['', '', 'Else'] as const, "TestEnum");
      }).toThrow(`Duplicate value '' in enum array. Values must be unique (case-insensitive).`);
    });

    it("should throw when array contains duplicate values (case-insensitive)", () => {
      expect(() => {
        CreateSafeEnumFromArray(['test', 'TEST', 'test2'] as const, "TestEnum");
      }).toThrow(`Duplicate value 'TEST' in enum array. Values must be unique (case-insensitive).`);
    });
  });

  describe("Edge Cases", () => {
    it("should handle falsy but valid values correctly", () => {
      // This test verifies that falsy but valid values work correctly
      const FalsyEnum = CreateSafeEnumFromArray(['0', 'false', ' '] as const, "FalsyEnum");
      
      // Get all entries to ensure we have the correct order
      const entries = FalsyEnum.getEntries();
      
      // We should have 3 entries
      expect(entries).toHaveLength(3);
      
      // Find each entry by its value
      // Each entry is a tuple of [key, SafeEnum], so we access the SafeEnum instance at index 1
      const zeroEntry = entries.find(([_, e]) => e.getValueOrThrow() === '0')?.[1];
      const falseEntry = entries.find(([_, e]) => e.getValueOrThrow() === 'false')?.[1];
      const spaceEntry = entries.find(([_, e]) => e.getValueOrThrow() === ' ')?.[1];
      
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
        const indices = entries.map(([_, e]) => e.getIndexOrThrow());
        expect(indices).toEqual([0, 1, 2]);
        
        // Verify lookup by index
        expect(FalsyEnum.fromIndex(0)).toBe(zeroEntry);
        expect(FalsyEnum.fromIndex(1)).toBe(falseEntry);
        expect(FalsyEnum.fromIndex(2)).toBe(spaceEntry);
      }
    });
    
    it("should handle empty arrays", () => {
      const EmptyEnum = CreateSafeEnumFromArray([] as const, "EmptyEnum");
      expect(EmptyEnum.getEntries()).toEqual([]);
      expect(EmptyEnum.getKeys()).toEqual([]);
      expect(EmptyEnum.getValues()).toEqual([]);
      expect(EmptyEnum.getEntries()).toEqual([]);
      expect(EmptyEnum.getIndexes()).toEqual([]);
    });
    
    it("should handle arrays with one element", () => {
      const SingleEnum = CreateSafeEnumFromArray(['test'] as const, "SingleEnum");
      expect(SingleEnum.TEST).toBeDefined();
      expect(SingleEnum.TEST.getValueOrThrow()).toBe('test');
      expect(SingleEnum.TEST.getIndexOrThrow()).toBe(0);
      expect(SingleEnum.fromValue('test')).toBe(SingleEnum.TEST);
      expect(SingleEnum.fromIndex(0)).toBe(SingleEnum.TEST);
    });
    
    it("should throw an error for duplicate values in array", () => {
      // Create an enum with duplicate values should throw an error
      // The error message shows the case of the value that triggered the duplicate check
      expect(() => {
        CreateSafeEnumFromArray(['test', 'test', 'test'] as const, "SingleEnum");
      }).toThrow(`Duplicate value 'test' in enum array. Values must be unique (case-insensitive).`);
      
      // Verify that case-insensitive duplicates are also caught
      // The error message shows the case of the value that triggered the duplicate check
      expect(() => {
        CreateSafeEnumFromArray(['first', 'Test', 'test', 'TEST'] as const, "SingleEnum");
      }).toThrow(`Duplicate value 'test' in enum array. Values must be unique (case-insensitive).`);
      
      // Verify with different case variations
      expect(() => {
        CreateSafeEnumFromArray(['FIRST', 'first', 'First'] as const, "SingleEnum");
      }).toThrow(`Duplicate value 'first' in enum array. Values must be unique (case-insensitive).`);
    });
  });
  
  // Type safety with TypeScript
  describe("TypeScript Integration", () => {
    // Create the enum
    const Status = CreateSafeEnumFromArray(['pending', 'approved', 'rejected'] as const, "Status");
    
    // Type alias using SafeEnum
    type StatusType = SafeEnum<"Status">;

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
      const Colors = CreateSafeEnumFromArray(COLORS, "Colors");
      
      expect(Colors.RED.value).toBe('red');
      expect(Colors.GREEN.value).toBe('green');
      expect(Colors.BLUE.value).toBe('blue');
    });
  });
});
