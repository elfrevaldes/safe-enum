import { describe, it, expect } from 'vitest';
import { CreateSafeEnum } from './safe-enum-factory';
import type { SafeEnum } from './types/interfaces/safe-enum';

describe('Tagged Enum Type Safety', () => {
  // Create two different enum types with the same structure
  const HttpProtocol = CreateSafeEnum({
    GET: { value: 'GET', index: 0 },
    POST: { value: 'POST', index: 1 },
    PUT: { value: 'PUT', index: 2 },
    DELETE: { value: 'DELETE', index: 3 },
    PATCH: { value: 'PATCH', index: 4 },
    OPTIONS: { value: 'OPTIONS', index: 5 },
    HEAD: { value: 'HEAD', index: 6 }
  } as const, 'HttpProtocol');

  const Roles = CreateSafeEnum({
    ADMIN: { value: 'admin', index: 0 },
    USER: { value: 'user', index: 1 },
    GUEST: { value: 'guest', index: 2 }
  } as const, 'Roles');

  // Define type aliases for each enum type
  type HttpProtocolType = SafeEnum<'HttpProtocol'>;
  type RolesType = SafeEnum<'Roles'>;

  // Test functions that accept specific enum types
  function acceptHttpProtocol(protocol: HttpProtocolType): string {
    return `Using HTTP protocol: ${protocol.value}`;
  }

  function acceptRole(role: RolesType): string {
    return `User has role: ${role.value}`;
  }

  it('Same enum type values are assignable to each other', () => {
    // These should work fine
    const protocol1: HttpProtocolType = HttpProtocol.GET;
    const protocol2: HttpProtocolType = HttpProtocol.POST;
    
    expect(protocol1.value).toBe('GET');
    expect(protocol2.value).toBe('POST');
  });

  it('Different enum type values are NOT assignable to each other', () => {
    // @ts-expect-error - This should be a type error
    const badProtocol: HttpProtocolType = Roles.ADMIN;
    
    // @ts-expect-error - This should be a type error
    const badRole: RolesType = HttpProtocol.GET;
  });

  it('Functions accept only the correct enum type', () => {
    // These should work fine
    expect(acceptHttpProtocol(HttpProtocol.GET)).toBe('Using HTTP protocol: GET');
    expect(acceptRole(Roles.ADMIN)).toBe('User has role: admin');

    // These should be type errors
    // @ts-expect-error - This should be a type error
    acceptHttpProtocol(Roles.ADMIN);
    Roles.ADMIN.__typeName
    
    // @ts-expect-error - This should be a type error
    acceptRole(HttpProtocol.GET);
  });

  it('Runtime type checking with isEnumValue', () => {
    // Same type checks should pass
    expect(HttpProtocol.isEnumValue(HttpProtocol.GET)).toBe(true);
    expect(Roles.isEnumValue(Roles.ADMIN)).toBe(true);
    
    // Cross-type checks should fail
    expect(HttpProtocol.isEnumValue(Roles.ADMIN)).toBe(false);
    expect(Roles.isEnumValue(HttpProtocol.GET)).toBe(false);
  });

  it('Type tag is present at runtime', () => {
    expect(HttpProtocol.GET.__typeName).toBe('HttpProtocol');
    expect(Roles.ADMIN.__typeName).toBe('Roles');
    
    // Different enum types have different type tags
    expect(HttpProtocol.GET.__typeName).not.toBe(Roles.ADMIN.__typeName);
  });
});
