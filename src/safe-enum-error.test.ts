import { CreateSafeEnum } from "./safe-enum-factory"
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe("SafeEnum Error Handling", () => {
  // Define a test enum
  const testEnumMap = {
    FOO: { value: 'foo', index: 0 },
    BAR: { value: 'bar', index: 1 },
    BAZ: { value: 'baz', index: 2 }
  } as const;

  const testEnum = CreateSafeEnum(testEnumMap);
  
  // Mock console.error before each test
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  // Restore console.error after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to get the last error message from the mock
  function getLastErrorMessage(): string {
    const calls = (console.error as any).mock.calls;
    return calls.length > 0 ? calls[calls.length - 1][0] : '';
  }

  describe("fromIndex", () => {
    it("should return undefined and log error for invalid index", () => {
      const result = testEnum.fromIndex(999);
      expect(result).toBeUndefined();
      
      const errorMessage = getLastErrorMessage();
      expect(errorMessage).toContain('No enum value with index 999');
      expect(errorMessage).toContain("Valid indices are: 'FOO': 0, 'BAR': 1, 'BAZ': 2");
    });
  });

  describe("fromValue", () => {
    it("should return undefined and log error for invalid value", () => {
      const result = testEnum.fromValue('invalid');
      expect(result).toBeUndefined();
      
      const errorMessage = getLastErrorMessage();
      expect(errorMessage).toContain("No enum value with value 'invalid'");
      expect(errorMessage).toContain("Valid values are: 'foo', 'bar', 'baz'");
    });
  });

  describe("fromKey", () => {
    it("should return undefined and log error for invalid key", () => {
      const result = testEnum.fromKey('INVALID');
      expect(result).toBeUndefined();
      
      const errorMessage = getLastErrorMessage();
      expect(errorMessage).toContain("No enum value with key 'INVALID'");
      expect(errorMessage).toContain("Valid keys are: 'FOO', 'BAR', 'BAZ'");
    });
  });

  describe("Instance methods", () => {
    it("should handle invalid lookups with proper error messages", () => {
      // Test instance method for invalid value
      const result1 = testEnum.FOO.fromValue('invalid');
      expect(result1).toBeUndefined();
      expect(getLastErrorMessage()).toContain("No enum value with value 'invalid'");
      
      // Test instance method for invalid index
      (console.error as any).mockClear();
      const result2 = testEnum.FOO.fromIndex(999);
      expect(result2).toBeUndefined();
      expect(getLastErrorMessage()).toContain('No enum value with index 999');
      
      // Test instance method for invalid key
      (console.error as any).mockClear();
      const result3 = testEnum.FOO.fromKey('INVALID');
      expect(result3).toBeUndefined();
      expect(getLastErrorMessage()).toContain("No enum value with key 'INVALID'");
    });
  });

  describe("Error Messages", () => {
    it("should include all valid values in error messages", () => {
      // Test value error message
      testEnum.fromValue('invalid');
      const valueError = getLastErrorMessage();
      expect(valueError).toContain("Valid values are: 'foo', 'bar', 'baz'");
      
      // Test key error message
      (console.error as any).mockClear();
      testEnum.fromKey('INVALID');
      const keyError = getLastErrorMessage();
      expect(keyError).toContain("Valid keys are: 'FOO', 'BAR', 'BAZ'");
      
      // Test index error message
      (console.error as any).mockClear();
      testEnum.fromIndex(999);
      const indexError = getLastErrorMessage();
      expect(indexError).toContain("Valid indices are: 'FOO': 0, 'BAR': 1, 'BAZ': 2");
    });
  });
});
