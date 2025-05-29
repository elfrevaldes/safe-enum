# type-safe-enum

[![npm version](https://img.shields.io/npm/v/type-safe-enum.svg)](https://www.npmjs.com/package/type-safe-enum)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/elfrevaldes/safe-enum/ci.yml)](https://github.com/elfrevaldes/safe-enum/actions)
[![codecov](https://codecov.io/gh/elfrevaldes/safe-enum/graph/badge.svg?token=CODECOV_TOKEN)](https://codecov.io/gh/elfrevaldes/safe-enum)

A type-safe, flexible enum factory for TypeScript with runtime validation and type inference. Create robust enums with minimal boilerplate while maintaining full type safety.

## Features

- **Type-safe**: Full TypeScript support with strict type checking
- **Runtime validation**: Verify enum values at runtime
- **Flexible**: Supports both string and numeric enums
- **Zero dependencies**: Lightweight and fast
- **Auto-completion**: Get full IntelliSense support in your IDE
- **Tested**: Comprehensive test coverage using [Vitest](https://vitest.dev/)
- **Tree-shakeable**: Only includes what you use
- **Bi-directional mapping** between keys and values
- **Auto-completion** for both keys and values
- **Zero dependencies**
- **Fully tested** with comprehensive test coverage
- **Immutable** by design
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

| Feature | Native Enum | String Unions | Const Objects | SafeEnum |
|---------|------------|---------------|---------------|----------|
| Type Safety | <div align="center">✅</div> | <div align="center">✅</div> | <div align="center">⚠️<br>(requires care)</div> | <div align="center">✅</div> |
| Runtime Safety | <div align="center">❌</div> | <div align="center">❌</div> | <div align="center">✅</div> | <div align="center">✅</div> |
| IntelliSense | <div align="center">✅</div> | <div align="center">✅</div> | <div align="center">✅</div> | <div align="center">✅</div> |
| Reverse Lookup | <div align="center">✅<br>(but unsafe)</div> | <div align="center">❌</div> | <div align="center">❌</div> | <div align="center">✅</div> |
| JSON Serialization | <div align="center">❌ <br>(numeric issues)</div> | <div align="center">✅</div> | <div align="center">✅</div> | <div align="center">✅</div> |
| Maintenance | <div align="center">❌ <br>(verbose)</div> | <div align="center">✅</div> | <div align="center">✅</div> | <div align="center">✅</div> |
| String Comparison | <div align="center">❌ <br>(can be confusing)</div> | <div align="center">❌</div> | <div align="center">❌</div> | <div align="center">✅</div> |
| Iteration | <div align="center">❌</div> | <div align="center">❌</div> | <div align="center">✅</div> | <div align="center">✅</div> |

## Basic Usage

```typescript
import { CreateSafeEnum } from 'type-safe-enum';

// Define your enum
const UserRole = CreateSafeEnum({
  ADMIN: { value: 'admin', index: 0 },
  EDITOR: { value: 'editor', index: 1 },
  VIEWER: { value: 'viewer', index: 2 },
} as const);

type UserRole = typeof UserRole;

// Access enum values
console.log(UserRole.ADMIN.value); // 'admin'
console.log(UserRole.ADMIN.index); // 0

// Type-safe reverse lookups
const role = UserRole.fromValue('editor'); // Returns UserRole.EDITOR | undefined
const roleByKey = UserRole.fromKey('ADMIN'); // Returns UserRole.ADMIN | undefined
const roleByIndex = UserRole.fromIndex(2); // Returns UserRole.VIEWER | undefined

// Runtime validation
if (UserRole.hasValue('admin')) {
  console.log('Valid role!');
}

// Iterate over values
for (const [key, value] of UserRole.entries()) {
  console.log(`${key}: ${value.value}`);
}
```

## Creating Enums from Arrays

You can create a SafeEnum directly from an array or tuple of string literals using `CreateSafeEnumFromArray`. This is the simplest way to define an enum when you only need string values and auto-assigned indices.

```typescript
import { CreateSafeEnumFromArray } from 'type-safe-enum';

const Status = CreateSafeEnumFromArray(["pending", "approved", "rejected"] as const);

// Access enum members
Status.PENDING.value; // "pending"
Status.APPROVED.index; // 1

// Type-safe lookups
const status = Status.fromValue("approved"); // Status.APPROVED | undefined
const byIndex = Status.fromIndex(2); // Status.REJECTED | undefined
const byKey = Status.fromKey("PENDING"); // Status.PENDING | undefined

// All keys and values
Status.keys(); // ["PENDING", "APPROVED", "REJECTED"]
Status.entries(); // [["PENDING", Status.PENDING], ...]

// TypeScript type inference
export type Status = typeof Status;
```

## Advanced Usage

### Auto-indexing

```typescript
// Indexes will be auto-assigned if not provided
const Status = CreateSafeEnum({
  PENDING: { value: 'pending' },     // index: 0
  PROCESSING: { value: 'processing' }, // index: 1
  COMPLETED: { value: 'completed' }    // index: 2
} as const);
```

### Mixed Explicit and Auto Indexes

```typescript
const Status = CreateSafeEnum({
  PENDING: { value: 'pending', index: 100 },
  PROCESSING: { value: 'processing' }, // auto-assigned: 101
  COMPLETED: { value: 'completed' }    // auto-assigned: 102
} as const);
```

### Type Safety

```typescript
// Type-safe comparisons
function handleStatus(status: UserRole.Values) {
  if (status.isEqual(UserRole.ADMIN)) {
    // TypeScript knows this is the admin case
    console.log('Admin access granted');
  }
}

// Type-safe array of values
const adminRoles = [UserRole.ADMIN, UserRole.EDITOR];

// Type-safe value checking
const isValid = adminRoles.some(role => role.isEqual(UserRole.ADMIN));
```

## API Reference

### Static Methods

| Method | Description | Example |
|--------|-------------|---------|
| `fromValue(value: string)` | Get enum entry by its value | `UserRole.fromValue('admin')` |
| `fromKey(key: string)` | Get enum entry by its key | `UserRole.fromKey('ADMIN')` |
| `fromIndex(index: number)` | Get enum entry by its index | `UserRole.fromIndex(0)` |
| `hasValue(value: string)` | Check if value exists | `UserRole.hasValue('admin')` |
| `hasKey(key: string)` | Check if key exists | `UserRole.hasKey('ADMIN')` |
| `hasIndex(index: number)` | Check if index exists | `UserRole.hasIndex(0)` |
| `isEnumValue(value: any)` | Type guard for enum values | `if (UserRole.isEnumValue(value)) { ... }` |
| <div align="left">`isEqual(`<br>&nbsp;&nbsp;&nbsp;&nbsp;`value: SafeEnumValue<T> \| `<br>&nbsp;&nbsp;&nbsp;&nbsp;`SafeEnumValue<T>[]`<br>): boolean`</div> | Compare enum values | `UserRole.isEqual([UserRole.ADMIN, UserRole.EDITOR]): boolean` |
| `values(): string[]` | Get all enum values as strings | `UserRole.values()` |
| `indexes(): number[]` | Get all enum indices as numbers | `UserRole.indexes()` |
| `getEntries(): SafeEnumValue<T>[]` | Get all enum entries (full value objects) | `UserRole.getEntries()` |
| `keys(): string[]` | Get all enum keys as strings | `UserRole.keys()` |
| `entries(): [string, SafeEnumValue<T>][]` | Get all [key, value] pairs | `UserRole.entries()` |

### Instance Methods

| Method | Description | Example |
|--------|-------------|---------|
| <div align="left">`isEqual(`<br>&nbsp;&nbsp;&nbsp;&nbsp;`other: SafeEnumValue<T> \| `<br>&nbsp;&nbsp;&nbsp;&nbsp;`SafeEnumValue<T>[]`<br>): boolean`</div> | Compare with another enum value or array of values | `UserRole.ADMIN.isEqual(otherRole)` |
| `toString(): string` | Get string representation in format `"KEY: (value), index: N"` | `UserRole.ADMIN.toString()` |
| `toJSON(): { key: string, value: string, index: number }` | Get JSON-serializable object | `UserRole.ADMIN.toJSON()` |

## Examples

### Working with Values and Indices

```typescript
const Colors = CreateSafeEnum({
  RED: { value: 'red', index: 1 },
  GREEN: { value: 'green', index: 2 },
  BLUE: { value: 'blue' }  // auto-assigned index: 3
} as const);

// Get all values as strings
const colorValues = Colors.values();
// Returns: ['red', 'green', 'blue']

// Get all indices
const colorIndices = Colors.indexes();
// Returns: [1, 2, 3]

// Get full enum value objects
const colorEntries = Colors.getEntries();
// Returns: [
//   { key: 'RED', value: 'red', index: 1, ... },
//   { key: 'GREEN', value: 'green', index: 2, ... },
//   { key: 'BLUE', value: 'blue', index: 3, ... }
// ]

// Iterate over entries with full type safety
for (const entry of Colors.getEntries()) {
  console.log(`${entry.key}: ${entry.value} (${entry.index})`);
}
```

## Real-World Examples

### API Response Validation

```typescript
// API response type
type ApiResponse<T> = {
  data: T;
  status: 'ok' | 'created' | 'bad_request' | 'unauthorized' | 'not_found' | 'server_error';
  message?: string;
};

// Define status codes using HTTP status codes as indexes
const StatusCode = CreateSafeEnum({
  OK: { value: 'ok', index: 200 },
  CREATED: { value: 'created', index: 201 },
  BAD_REQUEST: { value: 'bad_request', index: 400 },
  UNAUTHORIZED: { value: 'unauthorized', index: 401 },
  NOT_FOUND: { value: 'not_found', index: 404 },
  SERVER_ERROR: { value: 'server_error', index: 500 },
} as const);

// Type-safe status code handling
function handleResponse(response: ApiResponse<unknown>) {
  // Lookup by status code if it's a number
  let status = typeof response.status === 'number' 
    ? StatusCode.fromIndex(response.status)
    : StatusCode.fromValue(response.status);
    
  if (!status) {
    console.error('Unknown status code:', response.status);
    return;
  }
  
  if (status.index === 200) {  // Using HTTP status code for comparison
    console.log('Operation successful');
  } else if (status.index === 401) {  // Direct HTTP status code comparison
    console.error('Authentication required');
    // Can also use the enum directly
    // } else if (status.isEqual(StatusCode.UNAUTHORIZED)) {
  }
  
  // Access the HTTP status code and value
  console.log(`Status: ${status.index} ${status.value}`);  // e.g., "Status: 200 ok"
}
```

### Form State Management

```typescript
const FormState = CreateSafeEnum({
  IDLE: { value: 'idle', index: 0 },
  SUBMITTING: { value: 'submitting', index: 1 },
  SUCCESS: { value: 'success', index: 2 },
  ERROR: { value: 'error', index: 3 },
} as const);

function FormComponent() {
  const [state, setState] = useState(FormState.IDLE);
  
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

## Performance

SafeEnum is designed to be lightweight and efficient:

- **Fast lookups** - O(1) for `fromValue()`, `fromIndex()`, `hasValue()`, `hasIndex()`, and `hasKey()`
- **Efficient iteration** - O(n) for `getEntries()`, `entries()`, `values()`, and `indexes()`
- **Minimal memory footprint** - uses Maps for O(1) lookups
- **No runtime overhead** - all type information is removed during compilation

## License

MIT Elfre Valdes
