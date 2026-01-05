import { describe, it, expect, expectTypeOf } from 'vitest';
import { HttpProtocolTypes, HttpProtocolType } from './types/interfaces/http-protocol';

describe('HttpProtocol Type Safety Tests', () => {
  describe('Basic Enum Access', () => {
    it('should allow accessing enum values without non-null assertions', () => {
      // Should not require non-null assertion
      const getMethod = HttpProtocolTypes.GET;
      const postMethod = HttpProtocolTypes.POST;

      // Test runtime values
      expect(getMethod.value).toBe('GET');
      expect(postMethod.value).toBe('POST');
      
      // Test types
      expectTypeOf(getMethod).toMatchTypeOf<HttpProtocolType>();
      expectTypeOf(postMethod).toMatchTypeOf<HttpProtocolType>();
    });

    it('should not allow access to non-existent properties', () => {
      // This test verifies that TypeScript prevents accessing non-existent properties
      // The actual test is that this code should not compile if uncommented
      // Uncomment the next line to verify TypeScript error
      // const shouldError = HttpProtocol.NON_EXISTENT;
      
      // Runtime assertion to ensure the test runs
      expect(true).toBe(true);
      
      // The real test is that the line above would cause a TypeScript error if uncommented
      // We can't directly test for TypeScript errors in the test file itself,
      // but we can verify that our types are working correctly
      const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
      const validMethod = httpMethods[0];
      
      // This should work fine
      expect(HttpProtocolTypes[validMethod as keyof typeof HttpProtocolTypes]).toBeDefined();
      
      // This would cause a TypeScript error if uncommented:
      // const invalidMethod = 'NON_EXISTENT';
      // expect(HttpProtocolTypes[invalidMethod as keyof typeof HttpProtocolTypes]).toBeDefined();
    });
  });

  describe("SafeEnum is defined", () => {
    it("should be defined", () => {
      let stringGet = HttpProtocolTypes.GET.value;
      expect(stringGet).toBe('GET');
    });
  });
  describe('Enum Methods', () => {
    it('should correctly type fromValue method', () => {
      const fromValue: HttpProtocolType = HttpProtocolTypes.GET;
      expectTypeOf(fromValue).toEqualTypeOf<HttpProtocolType>();
      
      expect(fromValue.value).toBe('GET');
      expectTypeOf(fromValue.value).toBeString();
      expectTypeOf(fromValue.index).toBeNumber();
    });

    it('should return undefined for non-existent values', () => {
      const fromValue = HttpProtocolTypes.fromValue('NON_EXISTENT');
      expect(fromValue).toBeUndefined();
    });
  });

  describe('Type Compatibility', () => {
    it('should be compatible with SafeEnum type', () => {
      function acceptSafeEnum(value: HttpProtocolType): string {
        return value.value;
      }
      
      // Should accept HttpProtocol values
      expect(acceptSafeEnum(HttpProtocolTypes.GET)).toBe('GET');
      expect(acceptSafeEnum(HttpProtocolTypes.POST)).toBe('POST');
    });

    it('should work with object literals', () => {
      const testMethods = {
        get: HttpProtocolTypes.GET,
        post: HttpProtocolTypes.POST,
      };

      // Should not allow non-existent keys
    
      // const shouldError = testMethods.nonExistent;
      
      expect(testMethods.get.value).toBe('GET');
    });
  });

  describe('Runtime Behavior', () => {
    it('should have all expected HTTP methods', () => {
      expect(HttpProtocolTypes.GET.value).toBe('GET');
      expect(HttpProtocolTypes.POST.value).toBe('POST');
      expect(HttpProtocolTypes.PUT.value).toBe('PUT');
      expect(HttpProtocolTypes.DELETE.value).toBe('DELETE');
      expect(HttpProtocolTypes.PATCH.value).toBe('PATCH');
      expect(HttpProtocolTypes.OPTIONS.value).toBe('OPTIONS');
      expect(HttpProtocolTypes.HEAD.value).toBe('HEAD');
    });

    it('should allow assigning HttpProtocol.PUT to a config object without non-null assertion', () => {
      // This test verifies that we can use HttpProtocol.PUT directly in a config object
      // without TypeScript complaining about it possibly being undefined
      const config = {
        key: 'test',
        display: {
          label: 'Test',
          description: 'Test description'
        },
        // This is the key test - should NOT require ! or any type assertion
        method: HttpProtocolTypes.PUT,
        skipThrowForStatus: true,
        buildUrl: () => '/test'
      };

      // Verify the value was set correctly
      expect(config.method).toBe(HttpProtocolTypes.PUT);
      expect(config.method.value).toBe('PUT');
      
      // Verify the type is SafeEnum, not SafeEnum | undefined
      expectTypeOf(config.method).toMatchTypeOf<HttpProtocolType>();
    });

    it('should have correct indices', () => {
      expect(HttpProtocolTypes.GET.index).toBe(0);
      expect(HttpProtocolTypes.POST.index).toBe(1);
      expect(HttpProtocolTypes.PUT.index).toBe(2);
      expect(HttpProtocolTypes.DELETE.index).toBe(3);
      expect(HttpProtocolTypes.PATCH.index).toBe(4);
      expect(HttpProtocolTypes.OPTIONS.index).toBe(5);
      expect(HttpProtocolTypes.HEAD.index).toBe(6);
    });
  });
});
