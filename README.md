# type-safe-enum

[![npm version](https://img.shields.io/npm/v/type-safe-enum.svg)](https://www.npmjs.com/package/type-safe-enum)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/elfrevaldes/safe-enum/ci.yml)](https://github.com/elfrevaldes/safe-enum/actions)
[![codecov](https://codecov.io/gh/elfrevaldes/safe-enum/graph/badge.svg?token=CODECOV_TOKEN)](https://codecov.io/gh/elfrevaldes/safe-enum)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/type-safe-enum)](https://bundlephobia.com/package/type-safe-enum)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue.svg)](https://www.typescriptlang.org/)

A type-safe, flexible enum factory for TypeScript with runtime validation and type inference. Create robust enums with minimal boilerplate while maintaining full type safety. This package provides a more type-safe alternative to TypeScript's native enums with additional features like runtime validation, bi-directional mapping, and better type inference.

## Features

- **Type-safe** with full TypeScript support
- **Runtime validation** for keys, values, and indexes
- **Flexible**: Supports both string and numeric enums with mixed explicit/auto indexing
- **Zero dependencies** and lightweight (~2KB minified + gzipped)
- **Tested**: 100% test coverage with [Vitest](https://vitest.dev/)
- **Tree-shakeable**: Only includes what you use
- **Immutable** by design with Object.freeze
- **Auto-completion** for keys and values in modern IDEs
- **Bi-directional mapping** between keys, values, and indexes
- **Iterable** with built-in collection methods (map, filter, reduce, etc.)
- **JSON-serializable** with proper toJSON handling
- **Strict null checks** for better type safety

## Installation

```bash
npm install type-safe-enum
# or
yarn add type-safe-enum
# or
pnpm add type-safe-enum
```

## Requirements

- Node.js >= 16.0.0
- TypeScript >= 4.9.0
- npm >= 7.0.0 or yarn >= 1.22.0 or pnpm >= 6.0.0

## Quick Start Guide

### 1. Basic Usage with Array (Recommended)

```typescript
import { CreateSafeEnumFromArray } from 'type-safe-enum';

// Create an enum from an array of strings
const Status = CreateSafeEnumFromArray(["Pending", "Approved", "Rejected"] as const);

type Status = SafeEnum;  // 'Pending' | 'Approved' | 'Rejected'

// Usage
const current: Status = Status.PENDING;
console.log(current.value);  // 'Pending'
console.log(current.index);  // 0

// Type-safe lookups
const approved = Status.fromValue("Approved");  // Status.APPROVED | undefined
const pending = Status.fromKey("PENDING");     // Status.PENDING | undefined

// Type guards
if (Status.hasValue("Pending")) {
  // TypeScript knows this is valid
  const status: Status = Status.fromValue("Pending")!;
}
```

### 2. Advanced Usage with Custom Values

```typescript
import { CreateSafeEnum, SafeEnum } from 'type-safe-enum';

const UserRole = CreateSafeEnum({
  ADMIN: { value: 'admin', index: 0 },
  EDITOR: { value: 'editor', index: 1 },
  VIEWER: { value: 'viewer', index: 2 }
} as const);

type UserRole = SafeEnum;

// Usage
const role: UserRole = UserRole.ADMIN;
console.log(role.key);    // 'ADMIN'
console.log(role.value);  // 'admin'
console.log(role.index);  // 0

// Type-safe iteration
for (const [key, value] of UserRole.entries()) {
  console.log(`${key}: ${value.value}`);
}
```

## Why SafeEnum?

### Comparison with Other Approaches

| Feature            | Native Enum                                        | String Unions               | Const Objects                                  | SafeEnum                    |
| ------------------ | -------------------------------------------------- | --------------------------- | ---------------------------------------------- | --------------------------- |
| Type Safety        | <div align="center">✅</div>                        | <div align="center">✅</div> | <div align="center">⚠️<br>(requires care)</div> | <div align="center">✅</div> |
| Runtime Safety     | <div align="center">❌</div>                        | <div align="center">❌</div> | <div align="center">✅</div>                    | <div align="center">✅</div> |
| IntelliSense       | <div align="center">✅</div>                        | <div align="center">✅</div> | <div align="center">✅</div>                    | <div align="center">✅</div> |
| Reverse Lookup     | <div align="center">✅<br>(but unsafe)</div>        | <div align="center">❌</div> | <div align="center">❌</div>                    | <div align="center">✅</div> |
| JSON Serialization | <div align="center">❌ <br>(numeric issues)</div>   | <div align="center">✅</div> | <div align="center">✅</div>                    | <div align="center">✅</div> |
| Maintenance        | <div align="center">❌ <br>(verbose)</div>          | <div align="center">✅</div> | <div align="center">✅</div>                    | <div align="center">✅</div> |
| String Comparison  | <div align="center">❌ <br>(can be confusing)</div> | <div align="center">❌</div> | <div align="center">❌</div>                    | <div align="center">✅</div> |
| Iteration          | <div align="center">❌</div>                        | <div align="center">❌</div> | <div align="center">✅</div>                    | <div align="center">✅</div> |
| Bundle Size        | <div align="center">✅<br>(0kB)</div>              | <div align="center">✅<br>(0kB)</div> | <div align="center">✅<br>(0kB)</div> | <div align="center">✅<br>(~2kB)</div> |
| Tree Shaking       | <div align="center">❌</div>                        | <div align="center">✅</div> | <div align="center">✅</div>                    | <div align="center">✅</div> |

## Type System Overview

This library provides two main concepts:

1. **Enum Object**: The container that holds all enum values and utility methods (e.g., `Status`, `UserRole`)
2. **Enum Value**: A single value from the enum (e.g., `Status.PENDING`, `UserRole.ADMIN`)

### Key Types

- `SafeEnum`: Interface for a single enum value (contains `key`, `value`, `index`)
- `typeof Enum`: Type of the enum object (contains all values and utility methods)

## Quick Start

### 1. Simple Enum from Array (Recommended)

```typescript
import { CreateSafeEnumFromArray, SafeEnum } from 'type-safe-enum';

// Create an enum from an array of strings
const Status = CreateSafeEnumFromArray(["Pending", "Approved", "Rejected"] as const);

// Type for enum values
type Status = SafeEnum;

// Now you can use it like this:
let currentStatus: Status = Status.PENDING;
const approvedStatus: Status = Status.APPROVED;

// Access values
console.log(Status.PENDING.value);    // 'Pending'
console.log(Status.APPROVED.index);   // 1 (auto-assigned)

// Type-safe lookups
const approved = Status.fromValue("Approved");  // Status.APPROVED | undefined
const pending = Status.fromKey("PENDING");     // Status.PENDING | undefined

// Type-safe usage in functions
function processStatus(status: Status) {
  if (status.isEqual(Status.PENDING)) {
    return 'Processing...';
  }
  return 'Done!';
}
```

### Type Usage

Use the enum type directly in your code:

```typescript
// Import your enum
import { UserRole } from 'path-to-your-enum';

// Use the type in your code
function checkAccess(role: UserRole): boolean {
  return role === UserRole.ADMIN.value;
}
```

### 2. Basic Enum with Custom Values

```typescript
import { CreateSafeEnum, SafeEnum } from 'type-safe-enum';

// Create an enum with custom values and indices
const UserRole = CreateSafeEnum({
  ADMIN: { value: 'admin', index: 10 },
  EDITOR: { value: 'editor', index: 13 },
  VIEWER: { value: 'viewer' },  // Auto-assigns next available index (14)
} as const);

// Type for individual UserRole values
type UserRole = SafeEnum;

// Usage examples
const admin: UserRole = UserRole.ADMIN;
const editor: UserRole = UserRole.EDITOR;

// Type-safe usage in functions
function greet(userRole: UserRole) {
  if (userRole.isEqual(UserRole.ADMIN)) {
    return 'Hello Admin!';
  }
  return 'Welcome!';
}

// Type-safe lookups
const isValid = UserRole.hasValue('admin');  // true

// Get all values and keys
const allValues = UserRole.values();  // ['admin', 'editor', 'viewer']
const allKeys = UserRole.keys();      // ['ADMIN', 'EDITOR', 'VIEWER']
const allIndexes = UserRole.indexes(); // [10, 13, 14]
// Iterate over entries
for (const [key, value] of UserRole.entries()) {
  console.log(`${key}: ${value.value}`);
}
```

### 3. Advanced Usage: Auto-indexing and Mixed Indexes

```typescript
import { CreateSafeEnum, SafeEnum } from 'type-safe-enum';

// Auto-assigned indexes (0, 1, 2)
const Status = CreateSafeEnum({
  PENDING: { value: 'pending' },
  PROCESSING: { value: 'processing' },
  COMPLETED: { value: 'completed' }
} as const);

type Status = typeof Status.typeOf;

// Example usage
const currentStatus: Status = Status.PENDING;
console.log(currentStatus.index); // 0

// Mixed explicit and auto indexes
const Priority = CreateSafeEnum({
  LOW: { value: 'low'}, // auto: 0
  MEDIUM: { value: 'medium', index: 10 },  
  HIGH: { value: 'high' } // auto: 11
} as const);

type Priority = SafeEnum;

// Example usage
const priority: Priority = Priority.MEDIUM;
console.log(priority.index); // 10
```

## Real-World Examples

### API Response Validation

```typescript
import { CreateSafeEnum, SafeEnum } from 'type-safe-enum';

const StatusCode = CreateSafeEnum({
  OK: { value: 'ok', index: 200 },
  CREATED: { value: 'created', index: 201 },
  BAD_REQUEST: { value: 'bad_request', index: 400 },
  UNAUTHORIZED: { value: 'unauthorized', index: 401 },
  NOT_FOUND: { value: 'not_found', index: 404 },
  SERVER_ERROR: { value: 'server_error', index: 500 },
} as const);

type StatusCode = SafeEnum;

// Type-safe status code handling
function handleResponse(statusCode: number) {
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
const responseCode: StatusCode = StatusCode.OK;
console.log(handleResponse(200)); // 'Success!'
console.log(handleResponse(401)); // 'Please log in'
```

### Form State Management

```typescript
import { CreateSafeEnum, SafeEnum } from 'type-safe-enum';
import { useState } from 'react';

const FormState = CreateSafeEnum({
  IDLE: { value: 'idle', index: 10 },
  SUBMITTING: { value: 'submitting' }, // auto-indexed 11
  SUCCESS: { value: 'success', index: 20 },
  ERROR: { value: 'error' }, // auto-indexed 21
} as const);

type FormState = SafeEnum;

function FormComponent() {
  const [state, setState] = useState<FormState>(FormState.IDLE);
  
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

### `CreateSafeEnum(enumMap)`: `SafeEnum<T>`

Creates a type-safe enum from an object mapping.

### `CreateSafeEnumFromArray(values)`: `SafeEnum<T>`

Creates a type-safe enum from an array of string literals.

### Static Methods

| Method                                                                                                                                                     | Description                               | Example                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `fromValue(value: string)`                                                                                                                                 | Get enum entry by its value               | `UserRole.fromValue('admin')`                                  |
| `fromKey(key: string)`                                                                                                                                     | Get enum entry by its key                 | `UserRole.fromKey('ADMIN')`                                    |
| `fromIndex(index: number)`                                                                                                                                 | Get enum entry by its index               | `UserRole.fromIndex(0)`                                        |
| `hasValue(value: string)`                                                                                                                                  | Check if value exists                     | `UserRole.hasValue('admin')`                                   |
| `hasKey(key: string)`                                                                                                                                      | Check if key exists                       | `UserRole.hasKey('ADMIN')`                                     |
| `hasIndex(index: number)`                                                                                                                                  | Check if index exists                     | `UserRole.hasIndex(0)`                                         |
| `isEnumValue(value: any)`                                                                                                                                  | Type guard for enum values                | `if (UserRole.isEnumValue(value)) { ... }`                     |
| <div align="left">`isEqual(`<br>&nbsp;&nbsp;&nbsp;&nbsp;`value: SafeEnumValue<T> \| `<br>&nbsp;&nbsp;&nbsp;&nbsp;`SafeEnumValue<T>[]`<br>): boolean`</div> | Compare enum values                       | `UserRole.isEqual([UserRole.ADMIN, UserRole.EDITOR]): boolean` |
| `values(): string[]`                                                                                                                                       | Get all enum values as strings            | `UserRole.values()`                                            |
| `indexes(): number[]`                                                                                                                                      | Get all enum indices as numbers           | `UserRole.indexes()`                                           |
| `getEntries(): SafeEnumValue<T>[]`                                                                                                                         | Get all enum entries (full value objects) | `UserRole.getEntries()`                                        |
| `keys(): string[]`                                                                                                                                         | Get all enum keys as strings              | `UserRole.keys()`                                              |
| `entries(): [string, SafeEnumValue<T>][]`                                                                                                                  | Get all [key, value] pairs                | `UserRole.entries()`                                           |

### Instance Methods

| Method                                                                                                                                                     | Description                                                    | Example                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------- |
| <div align="left">`isEqual(`<br>&nbsp;&nbsp;&nbsp;&nbsp;`other: SafeEnumValue<T> \| `<br>&nbsp;&nbsp;&nbsp;&nbsp;`SafeEnumValue<T>[]`<br>): boolean`</div> | Compare with another enum value or array of values             | `UserRole.ADMIN.isEqual(otherRole)` |
| `toString(): string`                                                                                                                                       | Get string representation in format `"KEY: (value), index: N"` | `UserRole.ADMIN.toString()`         |
| `toJSON(): { key: string, value: string, index: number }`                                                                                                  | Get JSON-serializable object                                   | `UserRole.ADMIN.toJSON()`           |
| `Index(): number`                                                                                                                                          | Get the index of the enum value or Throws if undefined                               | `UserRole.ADMIN.Index()`         |
| `Key(): string`                                                                                                                                            | Get the key of the enum value or Throws if undefined                               | `UserRole.ADMIN.Key()`           |
| `Value(): string`                                                                                                                                          | Get the value of the enum value or Throws if undefined                               | `UserRole.ADMIN.Value()`         |

## Performance

- **Fast lookups** - O(1) for `fromValue()`, `fromIndex()`, `hasValue()`, `hasIndex()`, and `hasKey()`
- **Efficient iteration** - O(n) for `getEntries()`, `entries()`, `values()`, and `indexes()`
- **Minimal memory footprint** - uses Maps for O(1) lookups
- **No runtime overhead** - all type information is removed during compilation

## License

MIT © Elfre Valdes
