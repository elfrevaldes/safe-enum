# safe-enum

[![npm version](https://img.shields.io/npm/v/safe-enum.svg)](https://www.npmjs.com/package/safe-enum)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/elfrevaldes/safe-enum/ci.yml)](https://github.com/elfrevaldes/safe-enum/actions)
[![codecov](https://codecov.io/gh/elfrevaldes/safe-enum/graph/badge.svg?token=YOUR_TOKEN_HERE)](https://codecov.io/gh/elfrevaldes/safe-enum)

A type-safe, flexible enum factory for TypeScript with runtime validation and type inference. Create robust enums with minimal boilerplate while maintaining full type safety.

## Features

- 🛡️ **Type-safe**: Full TypeScript support with strict type checking
- 🔄 **Runtime validation**: Verify enum values at runtime
- 🧩 **Flexible**: Supports both string and numeric enums
- 🚀 **Zero dependencies**: Lightweight and fast
- 🔍 **Auto-completion**: Get full IntelliSense support in your IDE
- 🧪 **Tested**: Comprehensive test coverage
- 📦 **Tree-shakeable**: Only includes what you use
- 🔄 **Bi-directional mapping** between keys and values
- 🔍 **Auto-completion** for both keys and values
- 📦 **Zero dependencies**
- 🧪 **Fully tested** with comprehensive test coverage
- 🧊 **Immutable** by design
- 🔄 **Iterable** with built-in collection methods

## Installation

```bash
npm install safe-enum
# or
yarn add safe-enum
# or
pnpm add safe-enum
```

## Why SafeEnum?

### Comparison with Other Approaches

| Feature | Native Enum | String Unions | Const Objects | SafeEnum |
|---------|------------|---------------|---------------|----------|
| Type Safety | ✅ | ✅ | ⚠️ (requires care) | ✅ |
| Runtime Safety | ❌ | ❌ | ✅ | ✅ |
| IntelliSense | ✅ | ✅ | ✅ | ✅ |
| Reverse Lookup | ✅ (but unsafe) | ❌ | ❌ | ✅ |
| JSON Serialization | ❌ (numeric issues) | ✅ | ✅ | ✅ |
| Maintenance | ❌ (verbose) | ✅ | ✅ | ✅ |
| String Comparison | ❌ (can be confusing) | ❌ | ❌ | ✅ |
| Iteration | ❌ | ❌ | ✅ | ✅ |

## Basic Usage

```typescript
import { CreateSafeEnum } from 'safe-enum';

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
import { CreateSafeEnumFromArray } from 'safe-enum';

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
| `isEqual(value: SafeEnumValue<T> | SafeEnumValue<T>[])` | Compare enum values | `UserRole.isEqual([UserRole.ADMIN, UserRole.EDITOR])` |
| `values()` | Get all enum values | `UserRole.values()` |
| `keys()` | Get all enum keys | `UserRole.keys()` |
| `entries()` | Get all [key, value] pairs | `UserRole.entries()` |

### Instance Methods

| Method | Description | Example |
|--------|-------------|---------|
| `isEqual(other)` | Compare with another enum value | `UserRole.ADMIN.isEqual(otherRole)` |

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

- **O(1) lookups** for all operations
- **Minimal memory footprint** - only stores what's necessary
- **No runtime overhead** - all type information is removed during compilation

## License

MIT © [Your Name]
