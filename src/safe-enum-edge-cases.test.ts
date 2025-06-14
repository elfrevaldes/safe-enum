import { CreateSafeEnum, CreateSafeEnumFromArray } from "./safe-enum-factory"
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe("SafeEnum Edge Cases", () => {
  // Mock console.error before each test
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  // Restore console.error after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Auto-indexing", () => {
    it("should handle auto-indexing when index is not provided", () => {
      const enumMap = {
        FOO: { value: 'foo' },
        BAR: { value: 'bar' },
        BAZ: { value: 'baz' }
      };

      const result = CreateSafeEnum(enumMap);
      
      expect(result.FOO.index).toBe(0);
      expect(result.BAR.index).toBe(1);
      expect(result.BAZ.index).toBe(2);
      
      // Verify the values are properly set
      expect(result.fromIndex(0)?.value).toBe('foo');
      expect(result.fromIndex(1)?.value).toBe('bar');
      expect(result.fromIndex(2)?.value).toBe('baz');
    });

    it("should handle mixed explicit and auto-indexing", () => {
      const enumMap = {
        FOO: { value: 'foo', index: 10 },
        BAR: { value: 'bar' }, // Auto-indexed
        BAZ: { value: 'baz', index: 20 }
      };

      const result = CreateSafeEnum(enumMap);
      
      // Explicit indices should be preserved
      expect(result.FOO.index).toBe(10);
      expect(result.BAZ.index).toBe(20);
      
      // Auto-indexed should get next available index (21 in this case)
      expect(result.BAR.index).toBe(21);
    });
  });

  describe("isEnumValue Type Guard", () => {
    const testEnum = CreateSafeEnum({
      FOO: { value: 'foo', index: 0 },
      BAR: { value: 'bar', index: 1 }
    });

    it("should return false for non-object values", () => {
      expect(testEnum.isEnumValue(null)).toBe(false);
      expect(testEnum.isEnumValue(undefined)).toBe(false);
      expect(testEnum.isEnumValue(123)).toBe(false);
      expect(testEnum.isEnumValue('string')).toBe(false);
    });

    it("should return false for objects missing required properties", () => {
      expect(testEnum.isEnumValue({})).toBe(false);
      expect(testEnum.isEnumValue({ key: 'FOO' })).toBe(false);
      expect(testEnum.isEnumValue({ value: 'foo' })).toBe(false);
      expect(testEnum.isEnumValue({ index: 0 })).toBe(false);
    });

    it("should return true for valid enum values", () => {
      expect(testEnum.isEnumValue(testEnum.FOO)).toBe(true);
      expect(testEnum.isEnumValue(testEnum.BAR)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should auto-assign indices when not provided", () => {
      const result = CreateSafeEnum({
        FOO: { value: 'foo' } as any // Missing index, should be auto-assigned
      });
      
      expect(result.FOO.index).toBeDefined();
      expect(typeof result.FOO.index).toBe('number');
    });

    it("should handle duplicate indices in enum map", () => {
      expect(() => {
        CreateSafeEnum({
          FOO: { value: 'foo', index: 0 },
          BAR: { value: 'bar', index: 0 } // Duplicate index
        } as const);
      }).toThrow("Duplicate index 0 in enum map: 'BAR' conflicts with 'FOO'");
    });
  });

  describe("Lookup Methods", () => {
    const testEnum = CreateSafeEnum({
      FOO: { value: 'foo', index: 0 },
      BAR: { value: 'bar', index: 1 },
      BAZ: { value: 'baz', index: 2 }
    } as const);

    it("should log error for invalid index lookup", () => {
      const result = testEnum.fromIndex(999);
      expect(result).toBeUndefined();
      
      const errorMessage = (console.error as any).mock.calls[0][0];
      expect(errorMessage).toContain("No enum value with index 999");
      expect(errorMessage).toContain("Valid indices are: 'FOO': 0, 'BAR': 1, 'BAZ': 2");
    });

    it("should log error for invalid value lookup", () => {
      const result = testEnum.fromValue('invalid');
      expect(result).toBeUndefined();
      
      const errorMessage = (console.error as any).mock.calls[0][0];
      expect(errorMessage).toContain("No enum value with value 'invalid'");
      expect(errorMessage).toContain("Valid values are: 'foo', 'bar', 'baz'");
    });

    it("should log error for invalid key lookup", () => {
      const result = testEnum.fromKey('INVALID');
      expect(result).toBeUndefined();
      
      const errorMessage = (console.error as any).mock.calls[0][0];
      expect(errorMessage).toContain("No enum value with key 'INVALID'");
      expect(errorMessage).toContain("Valid keys are: 'FOO', 'BAR', 'BAZ'");
    });
  });

  describe("Type Guards", () => {
    const testEnum = CreateSafeEnum({
      FOO: { value: 'foo', index: 0 },
      BAR: { value: 'bar', index: 1 }
    } as const);

    it("should handle hasValue with invalid input", () => {
      expect(testEnum.hasValue(undefined as any)).toBe(false);
      expect(testEnum.hasValue(null as any)).toBe(false);
      expect(testEnum.hasValue(123 as any)).toBe(false);
    });

    it("should handle hasKey with invalid input", () => {
      expect(testEnum.hasKey(undefined as any)).toBe(false);
      expect(testEnum.hasKey(null as any)).toBe(false);
      expect(testEnum.hasKey(123 as any)).toBe(false);
    });

    it("should handle hasIndex with invalid input", () => {
      expect(testEnum.hasIndex(undefined as any)).toBe(false);
      expect(testEnum.hasIndex(null as any)).toBe(false);
      expect(testEnum.hasIndex('not a number' as any)).toBe(false);
    });
  });

  describe("isEqual Edge Cases", () => {
    const testEnum = CreateSafeEnum({
      FOO: { value: 'foo', index: 0 },
      BAR: { value: 'bar', index: 1 }
    } as const);

    it("should handle invalid input types", () => {
      expect(testEnum.FOO.isEqual(undefined as any)).toBe(false);
      expect(testEnum.FOO.isEqual(null as any)).toBe(false);
      expect(testEnum.FOO.isEqual('not an enum' as any)).toBe(false);
      expect(testEnum.FOO.isEqual(123 as any)).toBe(false);
      expect(testEnum.FOO.isEqual({} as any)).toBe(false);
    });

    it("should handle arrays with invalid items", () => {
      // Test with a valid enum value first to ensure the test setup is correct
      expect(testEnum.FOO.isEqual([testEnum.BAR])).toBe(false);
      
      // Test with invalid items - should not throw
      const testFn = () => testEnum.FOO.isEqual([
        undefined,
        null,
        'not an enum',
        123,
        {}
      ] as any);
      
      expect(testFn).not.toThrow();
      expect(testFn()).toBe(false);
    });
  });
});
