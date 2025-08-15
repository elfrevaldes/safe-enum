# Type-safe-enum

[![npm version](https://img.shields.io/npm/v/type-safe-enum.svg)](https://www.npmjs.com/package/type-safe-enum)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/elfrevaldes/safe-enum/ci.yml)](https://github.com/elfrevaldes/safe-enum/actions)
[![codecov](https://codecov.io/gh/elfrevaldes/safe-enum/graph/badge.svg?token=CODECOV_TOKEN)](https://codecov.io/gh/elfrevaldes/safe-enum)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/type-safe-enum)](https://bundlephobia.com/package/type-safe-enum)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue.svg)](https://www.typescriptlang.org/)

A type-safe, flexible enum factory for TypeScript with runtime validation and type inference. Create robust enums with minimal boilerplate while maintaining full type safety. This package provides a more type-safe alternative to TypeScript's native enums with additional features like runtime validation, bi-directional mapping, and better type inference.

## 🚀 Performance & Benefits

### Performance Optimizations

- **Blazing Fast Lookups** - O(1) constant time for all lookup operations:
  - `fromValue()`, `fromKey()`, `fromIndex()`
  - `hasValue()`, `hasKey()`, `hasIndex()`
  - `getKey()`, `getValue()`, `getIndex()`

- **Efficient Iteration** - O(n) linear time for collection operations:
  - `getEntries()`, `getKeys()`, `getValues()`, `getIndexes()`

- **Minimal Memory Footprint**
  - Uses `Map` for O(1) lookups by value, key, and index
  - No prototype pollution - clean object structure
  - Values are cached and reused

### ✨ Key Benefits

- **Type Safety First** - Full TypeScript support with strict type checking
- **Runtime Validation** - Verify enum values at runtime
- **Zero Dependencies** - No external packages required
- **Tiny Bundle** - ~2KB minified + gzipped
- **Tree-shakeable** - Only includes what you use
- **Immutable by Design** - Uses `Object.freeze()` to prevent modifications
- **Auto-completion** - Full IntelliSense support in modern IDEs
- **Serialization Ready** - Built-in `toJSON()` and `toString()` methods
- **Comprehensive API** - All the utility methods you need
- **Battle-tested** - Tested with [Vitest](https://vitest.dev/) to ensure 100% test coverage

### Comparison with Other Approaches

| Feature            | Native Enum                                        | String Unions                        | Const Objects                                  | type-safe-enum                        |
| ------------------ | -------------------------------------------------- | ------------------------------------ | ---------------------------------------------- | ------------------------------------- |
| Type Safety        | <div align="center">✅</div>                        | <div align="center">✅</div>          | <div align="center">⚠️<br>(requires care)</div> | <div align="center">✅<br>(nominal typing)</div> |
| Runtime Safety     | <div align="center">❌</div>                        | <div align="center">❌</div>          | <div align="center">✅</div>                    | <div align="center">✅</div>           |
| IntelliSense       | <div align="center">✅</div>                        | <div align="center">✅</div>          | <div align="center">✅</div>                    | <div align="center">✅</div>           |
| Reverse Lookup     | <div align="center">✅<br>(but unsafe)</div>        | <div align="center">❌</div>          | <div align="center">❌</div>                    | <div align="center">✅</div>           |
| JSON Serialization | <div align="center">❌ <br>(numeric issues)</div>   | <div align="center">✅</div>          | <div align="center">✅</div>                    | <div align="center">✅</div>           |
| Maintenance        | <div align="center">❌ <br>(verbose)</div>          | <div align="center">✅</div>          | <div align="center">✅</div>                    | <div align="center">✅</div>           |
| String Comparison  | <div align="center">❌ <br>(can be confusing)</div> | <div align="center">❌</div>          | <div align="center">❌</div>                    | <div align="center">✅</div>           |
| Iteration          | <div align="center">❌</div>                        | <div align="center">❌</div>          | <div align="center">✅</div>                    | <div align="center">✅</div>           |
| Bundle Size        | <div align="center">✅<br>(0kB)</div>               | <div align="center">✅<br>(0kB)</div> | <div align="center">✅<br>(0kB)</div>           | <div align="center">✅<br>(~2kB)</div> |
| Tree Shaking       | <div align="center">❌</div>                        | <div align="center">✅</div>          | <div align="center">✅</div>                    | <div align="center">✅</div>           |

### Native Enum
```typescript
enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}
/* 
* Can't easily validate a string
* Enums are compiled weirdly (numeric fallbacks, bi-directional maps)
* Serialization/deserialization is clumsy 
*/
function isValidRole(role: string): boolean {
  return Object.values(Role).includes(role as Role); // not type-safe
}
```

### String Unions
```typescript
// String Unions: No runtime validation or utilities
type Role = 'admin' | 'editor' | 'viewer';
/*
* Repeating the list of values manually everywhere
* Can't iterate roles cleanly
* No structure beyond flat string
*/
function isValidRole(role: string): role is Role {
  return ['admin', 'editor', 'viewer'].includes(role); // hardcoded list
}
```

### Const Objects
```typescript
// Const Objects: No runtime validation or utilities
const Role = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const;

type Role = typeof Role[keyof typeof Role];

/*
* Still no .fromValue() or .fromKey()
* No index, no rich object model
* No safe .map()/.entries(), just raw Object.entries()
* No default constObject.stringify() support
* Some IntelliSense support
* No reverse lookups
* No automatic indexing
*/
function isValidRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role); // still loose
}
```

### type-safe-enum
```typescript
import { CreateSafeEnumFromArray, type SafeEnum } from 'type-safe-enum';

/*
* Full runtime validation
* Safe .fromValue() / .fromKey()
* Safe .map() / .entries()
* safeEnum.toJSON() support
* Tree-shaking
* Full IntelliSense support
* Reverse lookups
* Automatic indexing
*/
const Status = 
  CreateSafeEnumFromArray(["Pending", "Approved", "Rejected"] as const, "Status");
// Type for enum values with nominal typing
type StatusType = SafeEnum<"Status">;

// Usage
const currentStatus: StatusType = Status.PENDING;
console.log(currentStatus.value);  // 'Pending'
console.log(currentStatus.index);  // 0 (auto-assigned)

// Type-safe lookups
const approved = Status.fromValue("Approved");  // Status.APPROVED | undefined
const pending = Status.fromKey("PENDING");      // Status.PENDING | undefined

// Type guards
if (Status.hasValue("Pending")) {
  // TypeScript knows this is valid
  const status: Status = Status.fromValue("Pending")!;
}

// Type-safe usage in functions
function processStatus(status: StatusType): string {
  if (status.isEqual(Status.APPROVED)) {
    return 'Approved!';
  }
  return 'Not approved!';
}

// Type usage in your code
function checkAccess(role: StatusType): boolean {
  return role.isEqual(Status.APPROVED);
}
```

## Requirements

- Node.js >= 16.0.0
- TypeScript >= 4.9.0
- npm >= 7.0.0 or yarn >= 1.22.0 or pnpm >= 6.0.0

## Installation

```bash
npm install type-safe-enum
# or
yarn add type-safe-enum
# or
pnpm add type-safe-enum
```

## Type System Overview

This library provides two main concepts:

1. **Enum Object**: The container that holds all enum values and utility methods (e.g., `Status`, `UserRole`)
2. **Enum Value**: A single value from the enum (e.g., `Status.PENDING`, `UserRole.ADMIN`)

### Key Types

- `SafeEnum<TypeName>`: Interface for a single enum value with nominal typing (contains `key`, `value`, `index`, and `__typeName`)
- `SafeEnumObject<TypeName>`: Interface for the enum object (contains all values and utility methods)

### Cross-Module Compatibility

The library is designed to work seamlessly across module boundaries in monorepos and complex TypeScript projects. Both `CreateSafeEnum` and `CreateSafeEnumFromArray` return `SafeEnumObject<TypeName>`, ensuring portable type definitions that avoid TS2742 errors when exporting enums between packages.

```typescript
// ✅ Works in cross-module scenarios
import { CreateSafeEnumFromArray, type SafeEnumObject, type SafeEnum } from "type-safe-enum"

export const envList: SafeEnumObject<"EnvType"> = CreateSafeEnumFromArray(
  ["development", "test", "testing", "production"],
  "EnvType"
)
export type EnvType = SafeEnum<"EnvType">
```

## Quick Start Guide

### 1. Enum with Custom Values and Indices

```typescript
import { CreateSafeEnum } from 'type-safe-enum';
import type { SafeEnum } from 'type-safe-enum';
// Create an enum with custom values and indices
const UserRole = CreateSafeEnum({
  ADMIN: { value: 'admin', index: 10 },    // Explicit index
  EDITOR: { value: 'editor', index: 13 },  // Explicit index
  VIEWER: { value: 'viewer' },             // Auto-assigns next index (14)
} as const, "UserRole");

type UserRoleType = SafeEnum<"UserRole">;

// Mixed explicit and auto indexes
const Priority = CreateSafeEnum({
  LOW: { value: 'low'},                   // auto: 0
  MEDIUM: { value: 'medium', index: 10 },  
  HIGH: { value: 'high' }                 // auto: 11
} as const, "Priority");
type PriorityType = SafeEnum<"Priority">;

// Usage examples
const admin: UserRoleType = UserRole.ADMIN;
console.log(admin.key);     // 'ADMIN'
console.log(admin.value);   // 'admin'
console.log(admin.index);   // 10

// Type-safe usage in functions
function greet(userRole: UserRoleType): string {
  if (userRole.isEqual(UserRole.ADMIN)) {
    return 'Hello Admin!';
  }
  return 'Welcome!';
}

// Type-safe lookups
const isValid = UserRole.hasValue('admin');  // true

// Get all values, keys, and indexes
const allValues = UserRole.values();    // ['admin', 'editor', 'viewer']
const allKeys = UserRole.keys();        // ['ADMIN', 'EDITOR', 'VIEWER']
const allIndexes = UserRole.indexes();  // [10, 13, 14]

// Iterate over entries
for (const [key, value] of UserRole.entries()) {
  console.log(`${key}: ${value.value} (${value.index})`);
}
```

## Real-World Examples

### API Response Validation

```typescript
import { CreateSafeEnum, type SafeEnum } from 'type-safe-enum';

const StatusCode = CreateSafeEnum({
  OK: { value: 'ok', index: 200 },
  CREATED: { value: 'created', index: 201 },
  BAD_REQUEST: { value: 'bad_request', index: 400 },
  UNAUTHORIZED: { value: 'unauthorized', index: 401 },
  NOT_FOUND: { value: 'not_found', index: 404 },
  SERVER_ERROR: { value: 'server_error', index: 500 },
} as const, "StatusCode");

type StatusCodeType = SafeEnum<"StatusCode">;

// Type-safe status code handling
function handleResponse(statusCode: number): string {
  const status = StatusCode.fromIndex(statusCode);
  if (!status) return 'Unknown status';
  
  if (status.index === StatusCode.OK.index) {
    return 'Success!';
  } else if (status.isEqual(StatusCode.UNAUTHORIZED)) {
    return 'Please log in';
  }
  return `Error: ${status.value}`;
}

// Example usage
const responseCode: StatusCodeType = StatusCode.OK;
console.log(handleResponse(200)); // 'Success!'
console.log(handleResponse(401)); // 'Please log in'
```

### Form State Management

```typescript
import { CreateSafeEnum, type SafeEnum } from 'type-safe-enum';
import { useState } from 'react';

const FormState = CreateSafeEnum({
  IDLE: { value: 'idle', index: 10 },
  SUBMITTING: { value: 'submitting' },  // auto-indexed 11
  SUCCESS: { value: 'success', index: 20 },
  ERROR: { value: 'error' },            // auto-indexed 21
} as const, "FormState");

type FormStateType = SafeEnum<"FormState">;

function FormComponent() {
  const [state, setState] = useState<FormStateType>(FormState.IDLE);
  
  // Example usage in event handlers
  const handleSubmit = async () => {
    try {
      setState(FormState.SUBMITTING);
      await submitForm();
      setState(FormState.SUCCESS);
    } catch (error) {
      setState(FormState.ERROR);
    }
  };
  
  return (
    <div>
      {state.isEqual(FormState.SUBMITTING) && <Spinner />}
      {state.isEqual(FormState.ERROR) && <ErrorBanner />}
      {state.isEqual(FormState.SUCCESS) && <SuccessMessage />}
      <button 
        onClick={handleSubmit}
        disabled={state.isEqual(FormState.SUBMITTING)}
      >
        Submit
      </button>
    </div>
  );
}
```

## API Reference

### `CreateSafeEnum(enumMap)`: `SafeEnumObject<TypeName>`

Creates a type-safe enum from an object mapping.

### `CreateSafeEnumFromArray(values)`: `SafeEnumObject<TypeName>`

Creates a type-safe enum from an array of string literals.

### Static Methods

| Method                                                                                                                                                     | Description                                      | Example                                                       |
|------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|--------------------------------------------------------------|
| `fromValue(value: string): SafeEnum<TypeName> | undefined`                                                                                                | Get enum value by string value                   | `UserRole.fromValue('admin')`                                 |
| `fromKey(key: string): SafeEnum<TypeName> | undefined`                                                                                                  | Get enum value by key                            | `UserRole.fromKey('ADMIN')`                                   |
| `fromIndex(index: number): SafeEnum<TypeName> | undefined`                                                                                                  | Get enum value by index                          | `UserRole.fromIndex(0)`                                       |
| `hasValue(value: string): boolean`                                                                                                                          | Check if value exists                            | `UserRole.hasValue('admin')`                                  |
| `hasKey(key: string): boolean`                                                                                                                              | Check if key exists                              | `UserRole.hasKey('ADMIN')`                                    |
| `hasIndex(index: number): boolean`                                                                                                                          | Check if index exists                            | `UserRole.hasIndex(0)`                                        |
| `isEqual(values: [SafeEnum<TypeName>, ...SafeEnum<TypeName>[]]): boolean`                                                                                       | Static method: Check if ALL enum values are equal | `if (UserRole.isEqual([role1, role2])) { ... }`               |
| <div align="left">`isEqual(`<br>&nbsp;&nbsp;&nbsp;&nbsp;`value: SafeEnum<TypeName> | `<br>&nbsp;&nbsp;&nbsp;&nbsp;`SafeEnum<TypeName>[]`<br>): boolean`</div> | Instance method: Check if enum value equals ANY in array | `role.isEqual([UserRole.ADMIN, UserRole.EDITOR]): boolean` |
| `getValues(): string[]`                                                                                                                                     | Get all enum values as strings                   | `UserRole.getValues()`                                        |
| `getIndexes(): number[]`                                                                                                                                    | Get all enum indices as numbers                  | `UserRole.getIndexes()`                                       |
| `getEntries(): [string, SafeEnumValue<T>][]`                                                                                                                | Get all [key, value] pairs                       | `UserRole.getEntries()`                                       |
| `getKeys(): string[]`                                                                                                                                       | Get all enum keys as strings                     | `UserRole.getKeys()`                                           |

### Instance Methods

| Method                                                                                                                                                     | Description                                                    | Example                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------- |
| <div align="left">`isEqual(`<br>&nbsp;&nbsp;&nbsp;&nbsp;`other: SafeEnumValue<T> \| `<br>&nbsp;&nbsp;&nbsp;&nbsp;`SafeEnumValue<T>[]`<br>): boolean`</div> | Compare with another enum value or array of values             | `UserRole.ADMIN.isEqual(otherRole)` |
| `toString(): string`                                                                                                                                       | Get string representation in format `"KEY: (value), index: N"` | `UserRole.ADMIN.toString()`         |
| `toJSON(): { key: string, value: string, index: number }`                                                                                                  | Get JSON-serializable object                                   | `UserRole.ADMIN.toJSON()`           |
| `getIndex(): number`                                                                                                                                       | Get the index of the enum value or Throws if undefined                               | `UserRole.ADMIN.getIndex()`      |
| `getKey(): string`                                                                                                                                         | Get the key of the enum value or Throws if undefined                               | `UserRole.ADMIN.getKey()`        |
| `getValue(): string`                                                                                                                                       | Get the value of the enum value or Throws if undefined                               | `UserRole.ADMIN.getValue()`      |

## License

MIT © Elfre Valdes

## Acknowledgments
- Jarom Loveridge (Helped improve type definitions)
- David Jones
- Scott Thorsen
- Charles Hugo

## ChatGPT's Opinion on type-safe-enum

> "Unlike traditional TypeScript enums, which can be opaque and error-prone (especially with numeric values and reverse mappings), type-safe-enum uses object literals or classes to infer literal union types that are transparent, predictable, and safe. It embraces the full power of TypeScript's type system to ensure better IntelliSense, stricter compile-time checks, and improved maintainability — particularly in large codebases and shared libraries.
> 
> I highly recommend type-safe-enum over native enums for most modern TypeScript projects. It's a cleaner, more reliable way to define constants and enum-like structures, without the pitfalls of traditional enums."
