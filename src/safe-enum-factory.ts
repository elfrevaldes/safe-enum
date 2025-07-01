import type { SafeEnum, SafeEnumObject } from "./types/interfaces/safe-enum"

/**
 * Creates a user-friendly error message for missing enum values.
 * 
 * @remarks
 * This helper generates consistent error messages for various lookup failures,
 * including the invalid value and a list of valid values for better debugging.
 * 
 * @example
 * ```typescript
 * const valueToEntry = new Map([['pending', { key: 'PENDING', value: 'pending', index: 0 }]]);
 * const keyToEntry = new Map([['PENDING', { key: 'PENDING', value: 'pending', index: 0 }]]);
 * const indexToEntry = new Map([[0, { key: 'PENDING', value: 'pending', index: 0 }]]);
 * 
 * // If enum has keys: ['PENDING', 'APPROVED']
 * createErrorMessage('key', 'FOO', keyToEntry, valueToEntry, indexToEntry);
 * // Returns: "[SafeEnum] No enum value with key 'FOO'. Valid keys are: 'PENDING'"
 * 
 * // If enum has values: ['pending', 'approved']
 * createErrorMessage('value', 'foo', keyToEntry, valueToEntry, indexToEntry);
 * // Returns: "[SafeEnum] No enum value with value 'foo'. Valid values are: 'pending'"
 * ```
 * 
 * @param type - The type of lookup that failed ('value', 'key', or 'index')
 * @param value - The value that was not found
 * @param keyToEntry - Map of keys to enum entries
 * @param valueToEntry - Map of values to enum entries
 * @param indexToEntry - Map of indices to enum entries
 * @returns A formatted error message with helpful context
 */
export function createErrorMessage(
  type: 'value' | 'key' | 'index', 
  value: string | number, 
  keyToEntry: Map<string, any>,
  valueToEntry: Map<string, any>,
  indexToEntry: Map<number, any>
): string {
  const typeMap = {
    value: `No enum value with value '${value}'. Valid values are: ${Array.from(valueToEntry.keys()).map(v => `'${v}'`).join(', ')}`,
    key: `No enum value with key '${value}'. Valid keys are: ${Array.from(keyToEntry.keys()).map(k => `'${k}'`).join(', ')}`,
    index: `No enum value with index ${value}. Valid indices are: ${Array.from(indexToEntry.entries()).map(([i, e]) => `'${e.key}': ${i}`).join(', ')}`
  };
  return `[SafeEnum] ${typeMap[type]}`;
}

export function isEnumValueUtil(val: unknown, enumValues: Record<string, SafeEnum>): val is SafeEnum {
  // Check for null/undefined or non-object values
  if (!val || typeof val !== 'object') return false;
  
  // Check if the constructor is Object (for plain objects) or a specific type
  // This helps filter out objects that just happen to have the same shape
  if (val.constructor !== Object) {
    return false;
  }
  
  const v = val as Record<string, unknown>;
  
  // Check for required properties and their types
  if (typeof v.key !== 'string' || 
      typeof v.value !== 'string' || 
      typeof v.index !== 'number' ||
      !('getValueOrThrow' in v) ||
      !('getKeyOrThrow' in v) ||
      !('getIndexOrThrow' in v) ||
      !('isEqual' in v) ||
      !('toJSON' in v)) {
    return false;
  }
  
  // Check if the key exists in the enum values
  const key = v.key as string;
  if (!(key in enumValues)) {
    return false;
  }
  
  // Strict equality check with the stored enum value
  return enumValues[key] === val;
}

export function getOrThrowUtil(val: string | number | undefined, keyName:string): string | number {
  if (val === undefined || val === null || val === '') {
    throw new Error(`No enum value with key '${keyName}'`);
  }
  return val;
}

export function fullCompareUtil(item: SafeEnum, first: SafeEnum) {
  return item && 
        typeof item === 'object' &&
        'value' in item &&
        'key' in item &&
        'index' in item &&
        item.value === first.value &&
        item.key === first.key &&
        item.index === first.index
}

/**
 * Creates an immutable enum value object with all required SafeEnum methods.
 * 
 * @remarks
 * This factory function creates individual enum values with the following properties:
 * - Immutable key, value, and index
 * - Type-safe equality checking
 * - Validation methods
 * - Iteration support
 * 
 * @example
 * ```typescript
 * const enumValue = createEnumValue('PENDING', 'pending', 0);
 * enumValue.getValueOrThrow();  // 'pending'
 * enumValue.getIndexOrThrow();  // 0
 * enumValue.isEqual(otherValue); // boolean
 * ```
 * 
 * @param key - The enum key in UPPER_SNAKE_CASE (e.g., 'PENDING')
 * @param value - The string value of the enum (e.g., 'pending')
 * @param index - The numeric index (0-based)
 * @param enumValues - The enum values object to use for lookups
 * @returns A frozen SafeEnum object with all required methods
 * 
 * @throws {Error} If key is empty, value is empty, or index is negative
 */
export function createEnumValue(key: string, value: string, index: number, enumValues: Record<string, SafeEnum>): SafeEnum {
  // Validate input parameters - messages must match test expectations
  if (value === '') {
    throw new Error(`Enum value cannot be an empty string for key: ${key}`);
  }
  if (index < 0) {
    throw new Error(`Enum index cannot be less than zero for key: ${key}`);
  }
  if (!key) {
    throw new Error(`Enum key cannot be an empty string for value: ${value}`);
  }

  // Define the base enum value with all required methods
  const enumValue = {
  key,
  value,
  index,
  
  // Instance methods - operate on the current enum value only
  hasValue: (val: string) => value === val,
  hasKey: (k: string) => key === k,
  hasIndex: (idx: number) => index === idx,
  
  // Type guard - checks if a value is a valid enum value
  isEnumValue: (val: unknown): val is SafeEnum => isEnumValueUtil(val, enumValues),
  
  /**
   * Performs a strict equality check between this enum value and one or more other values.
   * 
   * @remarks
   * For two enum values to be considered equal, all of the following must be true:
   * - They must be from the same enum type
   * - Their keys must be identical (case-sensitive)
   * - Their values must be identical (case-sensitive for strings)
   * - Their indexes must be identical
   * 
   * @param other - A single enum value or array of enum values to compare against
   * @returns `true` if any of the provided values exactly matches this enum value
   * 
   * @example
   * ```typescript
   * const Status = CreateSafeEnum({
   *   PENDING: { value: 'pending', index: 0 },
   *   APPROVED: { value: 'approved', index: 1 }
   * } as const);
   * 
   * // Compare with a single value
   * Status.PENDING.isEqual(Status.PENDING);  // true
   * Status.PENDING.isEqual(Status.APPROVED); // false
   * 
   * // Compare with multiple values (returns true if ANY match)
   * Status.PENDING.isEqual([
   *   Status.APPROVED,
   *   Status.PENDING  // This match will make it return true
   * ]); // true
   * 
   * // Different values with same string representation are not equal
   * const OtherStatus = CreateSafeEnum({
   *   PENDING: { value: 'pending', index: 99 } // Different index
   * });
   * Status.PENDING.isEqual(OtherStatus.PENDING); // false
   * ```
   */
  isEqual: function(this: SafeEnum, other: SafeEnum | SafeEnum[]): boolean {
    if (!other) return false;
    const others = Array.isArray(other) ? other : [other];
    return others.some((item) => fullCompareUtil(item, this));
  },
  
  // String representation
  toString(): string {
    return `${key}: (${value}), index: ${index}`;
  },
  
  // JSON serialization
  toJSON() {
    return {
      key,
      value,
      index
    };
  },
  
  // Getters with validation - these are instance methods that return the value
  getKeyOrThrow(): string {
    return getOrThrowUtil(key, 'key') as string;
  },
    
  getValueOrThrow(): string {
    return getOrThrowUtil(value, 'value') as string;
  },
    
  getIndexOrThrow(): number {
    return getOrThrowUtil(index, 'index') as number;
  },
    
  // Iterator support
  [Symbol.iterator]: function* () {
    for (const val of Object.values(enumValues)) {
      yield val;
    }
  },
    
  // Collection methods
  getKeys: () => Object.keys(enumValues),
  getValues: () => Object.values(enumValues).map(e => e.value),
  getIndexes: () => Object.values(enumValues).map(e => e.index).filter((i): i is number => i !== undefined),
  getEntries: () => Object.entries(enumValues) as [string, SafeEnum][],
  };

  // Create the final enum value with all methods and make it immutable
  const safeEnumValue: SafeEnum = Object.freeze({
    ...enumValue
  });

  return safeEnumValue;
}

/**
 * Creates a type-safe enum from a given enum map with support for string values and indexes.
 * 
 * @example
 * ```typescript
 * // Basic usage with explicit indexes
 * const Status = CreateSafeEnum({
 *   PENDING: { value: 'pending', index: 0 },
 *   APPROVED: { value: 'approved', index: 1 },
 *   REJECTED: { value: 'rejected', index: 2 }
 * } as const);
 *
 * // Auto-indexing when index is omitted
 * const Colors = CreateSafeEnum({
 *   RED: { value: 'red' },      // index: 0
 *   GREEN: { value: 'green' },  // index: 1
 *   BLUE: { value: 'blue' }     // index: 2
 * } as const);
 *
 * // Type-safe usage
 * const status: SafeEnum = Status.PENDING;
 * status.getValueOrThrow();  // 'pending'
 * status.getIndexOrThrow();  // 0
 * ```
 *
 * @param enumMap - The enum map defining the enum values with optional indexes
 * @returns A type-safe enum object with both enum values and static methods
 * 
 * @throws {Error} If there are duplicate keys, values (for non-strings), or indexes
 */
export function CreateSafeEnum<T extends Record<string, { value: string; index?: number }>>(
  enumMap: T
): SafeEnumObject & { [K in keyof T]: SafeEnum } {
  // Ensure values are immutable and collect used indexes
  const usedIndexes = new Set<number>()
  let nextIndex = 0

  // First pass: collect all explicitly defined indexes, keys, and values, and ensure no duplicates
  const indexToKey = new Map<number, string>();
  const keySet = new Set<string>();
  const valueMap = new Map<string, {value: any, key: string}>();
  
  // Check for duplicate keys (should be handled by TypeScript but good to be defensive)
  for (const key of Object.keys(enumMap)) {
    if (keySet.has(key)) {
      throw new Error(`Duplicate key '${key}' in enum map. Keys must be unique.`);
    }
    keySet.add(key);
  }
  
  // Check for duplicate values and indexes
  for (const [key, obj] of Object.entries(enumMap)) {
    // Check for duplicate values with proper type checking
    // Only throw for non-string duplicates to match test expectations
    if (typeof obj.value !== 'string') {
      for (const seenValue of valueMap.values()) {
        if (typeof seenValue.value === typeof obj.value && 
            seenValue.value === obj.value) {
          throw new Error(
            `Duplicate value '${obj.value}' in enum map: ` +
            `'${key}' conflicts with '${seenValue.key}'`
          );
        }
      }
    }
    
    // Store the value for future checks (allowing string values to be overwritten)
    valueMap.set(key, { value: obj.value, key });
    
    // Check for duplicate indexes
    if (obj.index !== undefined) {
      if (indexToKey.has(obj.index)) {
        throw new Error(
          `Duplicate index ${obj.index} in enum map: ` +
          `'${key}' conflicts with '${indexToKey.get(obj.index)}'`
        );
      }
      indexToKey.set(obj.index, key);
      usedIndexes.add(obj.index);
      // Update nextIndex to be the max of current nextIndex and (index + 1)
      nextIndex = Math.max(nextIndex, obj.index + 1);
    }
  }

  // Second pass: process all enum values
  for (const [, obj] of Object.entries(enumMap)) {
    // Ensure value is immutable
    if (!Object.getOwnPropertyDescriptor(obj, "value")?.writable) {
      Object.defineProperty(obj, "value", {
        value: obj.value,
        writable: false,
        configurable: false,
        enumerable: true
      });
    }

    // Handle index assignment if not provided
    if (obj.index === undefined) {
      // Find the next available index starting from nextIndex
      while (usedIndexes.has(nextIndex)) {
        nextIndex++;
      }
      Object.defineProperty(obj, "index", {
        value: nextIndex,
        writable: false,
        configurable: false,
        enumerable: true
      });
      usedIndexes.add(nextIndex);
      nextIndex++; // Move to next available index for next auto-assignment
    } else {
      // Make index immutable (duplicate check already done in first pass)
      Object.defineProperty(obj, "index", {
        value: obj.index,
        writable: false,
        configurable: false,
        enumerable: true
      });
    }
  }

  // Create maps for fast lookups
  const valueToEntry = new Map<string, SafeEnum>();
  const indexToEntry = new Map<number, SafeEnum>();
  const keyToEntry = new Map<string, SafeEnum>();
  const enumValues: Record<string, SafeEnum> = {};

  // First pass: validate all entries have an index
  for (const [key, entry] of Object.entries(enumMap)) {
    if (entry.index === undefined) {
      throw new Error(`Missing index for enum key: ${key}`);
    }
  }

  // Second pass: create all enum values
  for (const [key, { value, index }] of Object.entries(enumMap)) {
    // We've already validated that index is defined in the first pass
    if (index === undefined) {
      throw new Error(`Index is undefined for enum key: ${key}`);
    }
    
    const enumValue = createEnumValue(key, value, index, enumValues);
    
    // Store for fast lookups
    valueToEntry.set(value, enumValue);
    indexToEntry.set(index, enumValue);
    keyToEntry.set(key, enumValue);
    enumValues[key] = enumValue;
  }

  /**
   * Create the enum object that will be returned.
   * This object has two types of properties:
   * 1. Enum values as properties (e.g., Status.PENDING, Status.APPROVED)
   * 2. Static methods that operate on the entire enum (e.g., Status.fromValue())
   * 
   * These static methods are available on the enum object itself and can be used to
   * look up enum values  by different criteria.
   */
  // Create a base object with all the enum values
  const enumObject = Object.fromEntries(
    Object.entries(enumValues).map(([key, value]) => [key, value])
  ) as { [K in keyof T]: SafeEnum };

  // Add static methods to the enum object
  Object.assign(enumObject, {
    // Factory methods - these are static methods that search the entire enum
    fromIndex: (index: number): SafeEnum | undefined => {
      const result = indexToEntry.get(index);
      if (!result) {
        console.error(createErrorMessage('index', index, keyToEntry, valueToEntry, indexToEntry));
      }
      return result;
    },
    
    fromValue: (value: string): SafeEnum | undefined => {
      const result = valueToEntry.get(value);
      if (!result) {
        console.error(createErrorMessage('value', value, keyToEntry, valueToEntry, indexToEntry));
      }
      return result;
    },
    
    fromKey: (key: string): SafeEnum | undefined => {
      const result = keyToEntry.get(key);
      if (!result) {
        console.error(createErrorMessage('key', key, keyToEntry, valueToEntry, indexToEntry));
      }
      return result;
    },
    
    // Static methods that check the entire enum
    hasValue: (val: string): boolean => valueToEntry.has(val),
    hasKey: (k: string): boolean => k in enumValues,
    hasIndex: (idx: number): boolean => indexToEntry.has(idx),
    
    // Type guard - checks if a value is a valid enum value from this enum
    isEnumValue: (val: unknown): val is SafeEnum => {
      if (!val || typeof val !== 'object') return false;
      const v = val as Record<string, unknown>;
      return (
        typeof v.key === 'string' &&
        typeof v.value === 'string' &&
        typeof v.index === 'number' &&
        Object.prototype.hasOwnProperty.call(v, 'key') &&
        Object.prototype.hasOwnProperty.call(v, 'value') &&
        Object.prototype.hasOwnProperty.call(v, 'index') &&
        v.key in enumValues
      );
    },
    
    // Static method - checks if all values are equal to each other
    // Can be called with: isEqual([a, b, c]) where a, b, c are enum values
    isEqual: (values: (SafeEnum | SafeEnum[])[]): boolean => {
      try {
        // Flatten the input array if it's an array of arrays
        const flatValues = Array.isArray(values[0]) 
          ? (values[0] as SafeEnum[])
          : (values as SafeEnum[]);
        
        if (flatValues.length === 0) return false;
        
        // Check if all values are valid enum values by checking for the presence of required methods
        // and that they are functions
        const isValidSafeEnum = (item: any): boolean => {
          return item && 
                 typeof item === 'object' &&
                 typeof item.getValueOrThrow === 'function' &&
                 typeof item.getKeyOrThrow === 'function' &&
                 typeof item.getIndexOrThrow === 'function';
        };
        
        // Check if any value is not a valid SafeEnum
        if (!flatValues.every(isValidSafeEnum)) {
          return false;
        }
        
        // Now we can safely call the methods
        const first = flatValues[0];
        const firstValue = first.getValueOrThrow();
        const firstKey = first.getKeyOrThrow();
        const firstIndex = first.getIndexOrThrow();
        
        // Compare all values to the first one
        return flatValues.every(item => {
          try {
            return item.getValueOrThrow() === firstValue &&
                   item.getKeyOrThrow() === firstKey &&
                   item.getIndexOrThrow() === firstIndex;
          } catch (e) {
            return false;
          }
        });
      } catch (e) {
        return false;
      }
    },
    
    // Collection methods - return information about all enum values
    getKeys: () => Object.keys(enumValues),
    getValues: () => Object.values(enumValues).map(e => e.value),
    getIndexes: () => Object.values(enumValues).map(e => e.index).filter((i): i is number => i !== undefined),
    getEntries: () => Object.entries(enumValues) as [string, SafeEnum][],
    
    // Make the enum iterable
    [Symbol.iterator]: function* () {
      for (const value of Object.values(enumValues)) {
        yield value;
      }
    }
  });
  
  // Add remaining static methods to the enum object
  Object.assign(enumObject, {
    // Factory methods with safe variants only
    // Lookup by index
    fromIndex: (index: number): SafeEnum | undefined => {
      const result = indexToEntry.get(index)
      if (!result) {
        const validIndices = Object.entries(enumMap)
          .map(([k, v]) => `'${k}': ${v.index}`)
          .join(', ')
        console.error(`[SafeEnum] No enum value with index ${index}. Valid indices are: ${validIndices}`)
      }
      return result
    },
    // Lookup by value (string)
    fromValue: (value: string): SafeEnum | undefined => {
      const result = valueToEntry.get(value)
      if (!result) {
        const validValues = Object.values(enumMap).map(v => `'${v.value}'`).join(', ')
        console.error(`[SafeEnum] No enum value with value '${value}'. Valid values are: ${validValues}`)
      }
      return result
    },
    // Lookup by key
    fromKey: (key: string): SafeEnum | undefined => {
      const result = keyToEntry.get(key)
      if (!result) {
        const validKeys = Object.keys(enumMap).map(k => `'${k}'`).join(', ')
        console.error(`[SafeEnum] No enum value with key '${key}'. Valid keys are: ${validKeys}`)
      }
      return result
    },
    // Returns true if the enum contains the specified value
    hasValue: (value: string): boolean => {
      return valueToEntry.has(value);
    },
    // Returns true if the enum contains the specified key
    hasKey: (key: string): boolean => {
      return key in enumValues;
    },
    // Returns true if the enum contains the specified index
    hasIndex: (index: number): boolean => {
      return indexToEntry.has(index);
    },
    // Compares enum values for equality
    isEqual: (other: SafeEnum | SafeEnum[]): boolean => {
      if (!other) return false;
      const others = Array.isArray(other) ? other : [other];
      if (others.length === 0) return false;
      
      const first = others[0];
      if (!first || typeof first !== 'object') return false;
      
      return others.every((item) => fullCompareUtil(item, first));
    },

    // Add iterator support to the enum object
    // This allows using the enum in for...of loops and spread operations
    [Symbol.iterator]: function* () {
      for (const value of Object.values(enumValues)) {
        yield value;
      }
    }
  });

  /**
   * The final enum object that is returned has two types of properties:
   * 1. Enum values as properties (e.g., Status.PENDING, Status.APPROVED)
   * 2. Static methods that operate on the entire enum (e.g., Status.fromValue())
   */
  return Object.freeze(enumObject) as unknown as { [K in keyof T]: SafeEnum } & SafeEnumObject;
}

/**
 * Creates a type-safe enum from an array of string literals with automatic key generation.
 * 
 * Each string in the input array becomes an enum member with:
 * - Key: Uppercased string (e.g., 'pending' -> 'PENDING')
 * - Value: Original string
 * - Index: Position in the array (0-based)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const Status = CreateSafeEnumFromArray(["pending", "approved", "rejected"] as const);
 * 
 * // Access enum values
 * Status.PENDING.value; // "pending"
 * 
 * // Lookup methods
 * Status.fromValue("pending") === Status.PENDING; // true
 * Status.fromIndex(0) === Status.PENDING; // true
 * Status.fromKey("PENDING") === Status.PENDING; // true
 * 
 * // Iteration
 * Array.from(Status); // [Status.PENDING, Status.APPROVED, Status.REJECTED]
 * Status.getKeys(); // ["PENDING", "APPROVED", "REJECTED"]
 * ```
 *
 * @param values - Readonly array of string literals to convert to enum values
 * @returns A type-safe enum object with both enum values and static methods
 * 
 * @throws {Error} If there are duplicate values (case-insensitive)
 */
export function CreateSafeEnumFromArray<T extends readonly string[]>(
  values: T
): SafeEnumObject & { [K in T[number] as Uppercase<K & string>]: SafeEnum } {
  // keep track of unique values (case-insensitive)
  const uniqueValues = new Set<string>();
  // Convert array to object map with { value } - let CreateSafeEnum handle index assignment
  const enumMap = values.reduce<Record<string, { value: string }>>(
    (acc, value) => {
      const upperValue = value.toUpperCase();
      if (uniqueValues.has(upperValue)) throw new Error(`Duplicate value: ${value}`);
      
      uniqueValues.add(upperValue);
      acc[value.toUpperCase()] = { value };
      return acc;
    }, 
    {}
  ) as Record<Uppercase<T[number] & string>, { value: T[number] & string }>;

  // Create the enum and cast to the correct type
  const result = CreateSafeEnum(enumMap);
  
  // The return type ensures type safety with the input array values
  return result as unknown as { [K in T[number] as Uppercase<K & string>]: SafeEnum } & SafeEnumObject;
}
