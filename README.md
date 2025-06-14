# type-safe-enum

[![npm version](https://img.shields.io/npm/v/type-safe-enum.svg)](https://www.npmjs.com/package/type-safe-enum)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/elfrevaldes/safe-enum/ci.yml)](https://github.com/elfrevaldes/safe-enum/actions)
[![codecov](https://codecov.io/gh/elfrevaldes/safe-enum/graph/badge.svg?token=CODECOV_TOKEN)](https://codecov.io/gh/elfrevaldes/safe-enum)

A type-safe, flexible enum factory for TypeScript with runtime validation and type inference. Create robust enums with minimal boilerplate while maintaining full type safety.

## Features

- **Type-safe** with full TypeScript support
- **Runtime validation** for keys, values, and indexes
- **Flexible**: Supports both string and numeric enums
- **Zero dependencies** and lightweight
- **Tested**: Comprehensive test coverage using [Vitest](https://vitest.dev/)
- **Tree-shakeable**: Only includes what you use
- **Immutable** by design
- **Auto-completion** for keys and values
- **Bi-directional mapping** between keys, values, and indexes
- **Iterable** with built-in collection methods

## Installation

```bash
npm install type-safe-enum
# or
yarn add type-safe-enum
# or
pnpm add type-safe-enum
```
## Requirements

- Node.js >= 14.0.0
- npm >= 10

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

## Quick Start

### 1. Simple Enum from Array (Recommended)

```typescript
import { CreateSafeEnumFromArray, type SafeEnum } from 'type-safe-enum';

// Simplest way to create a type-safe enum
const Status = CreateSafeEnumFromArray(["Pending", "Approved", "Rejected"] as const);
type Status = typeof Status;  // Export this type for use in your app

// Access values
console.log(Status.PENDING.value);    // 'Pending'
console.log(Status.APPROVED.index);   // 1 (auto-assigned)

// Type-safe lookups
const status = Status.fromValue("Approved");  // Status.APPROVED | undefined
const byKey = Status.fromKey("PENDING");     // Status.PENDING | undefined

// Type-safe usage in functions
function processStatus(status: Status) {
  if (status.isEqual(Status.PENDING)) {
    return 'Processing...';
  }
  return 'Done!';
}
```

### 2. Basic Enum with Custom Values

```typescript
import { CreateSafeEnum, type SafeEnum } from 'type-safe-enum';

const UserRole = CreateSafeEnum({
  ADMIN: { value: 'admin', index: 10 },
  EDITOR: { value: 'editor', index: 13 },
  VIEWER: { value: 'viewer' },  // Auto-assigns next available index (14)
} as const);

// Type-safe usage
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
// Auto-assigned indexes (0, 1, 2)
const Status = CreateSafeEnum({
  PENDING: { value: 'pending' },
  PROCESSING: { value: 'processing' },
  COMPLETED: { value: 'completed' }
} as const);

// Mixed explicit and auto indexes
const Priority = CreateSafeEnum({
  LOW: { value: 'low'}, // auto: 0
  MEDIUM: { value: 'medium', index: 10 },  
  HIGH: { value: 'high' } // auto: 11
} as const);
```

## Real-World Examples

### API Response Validation

```typescript
const StatusCode = CreateSafeEnum({
  OK: { value: 'ok', index: 200 },
  CREATED: { value: 'created', index: 201 },
  BAD_REQUEST: { value: 'bad_request', index: 400 },
  UNAUTHORIZED: { value: 'unauthorized', index: 401 },
  NOT_FOUND: { value: 'not_found', index: 404 },
  SERVER_ERROR: { value: 'server_error', index: 500 },
} as const);

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
```

### Form State Management

```typescript
const FormState = CreateSafeEnum({
  IDLE: { value: 'idle', index: 10 },
  SUBMITTING: { value: 'submitting' }, // auto-indexed 11
  SUCCESS: { value: 'success', index: 20 },
  ERROR: { value: 'error' }, // auto-indexed 21
} as const);

type FormState = typeof FormState;

function FormComponent() {
  const [state, setState] = useState<FormState>(FormState.IDLE);
  
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


## Performance

- **Fast lookups** - O(1) for `fromValue()`, `fromIndex()`, `hasValue()`, `hasIndex()`, and `hasKey()`
- **Efficient iteration** - O(n) for `getEntries()`, `entries()`, `values()`, and `indexes()`
- **Minimal memory footprint** - uses Maps for O(1) lookups
- **No runtime overhead** - all type information is removed during compilation

## License

MIT © Elfre Valdes
