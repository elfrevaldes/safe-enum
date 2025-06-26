import type { SafeEnum, SafeEnumObject } from "./types/interfaces/safe-enum"

/**
 * Creates a type-safe enum from a given enum map
 *
 * @example
 * ```typescript
 * const Status = CreateSafeEnum({
 *   PENDING: { value: 'pending', index: 0 },
 *   APPROVED: { value: 'approved', index: 1 },
 *   REJECTED: { value: 'rejected', index: 2 }
 * } as const);
 *
 * // Type of an individual enum value
 * const status: SafeEnum = Status.PENDING;
 * ```
 *
 * @param enumMap - The enum map defining the enum values
 * @returns A type-safe enum object with lookup methods
 */
export function CreateSafeEnum<T extends Record<string, { value: string; index?: number }>>(
  enumMap: T
): { [K in keyof T]: SafeEnum } & SafeEnumObject {
  // Ensure values are immutable and collect used indexes
  const usedIndexes = new Set<number>()
  let nextIndex = 0

  // First pass: collect all explicitly defined indexes and ensure no duplicates
  const indexToKey = new Map<number, string>();
  for (const [key, obj] of Object.entries(enumMap)) {
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
  // Create a map from value to enum entry for faster lookups
  const valueToEntry = new Map<string, SafeEnum>()
  const indexToEntry = new Map<number, SafeEnum>()
  const keyToEntry = new Map<string, SafeEnum>()
  const enumValues: Record<string, SafeEnum> = {}
  
  // Helper function to create error message for missing values
  function createErrorMessage(type: 'value' | 'key' | 'index', value: string | number): string {
    const typeMap = {
      value: `No enum value with value '${value}'. Valid values are: ${Array.from(valueToEntry.keys()).map(v => `'${v}'`).join(', ')}`,
      key: `No enum value with key '${value}'. Valid keys are: ${Array.from(keyToEntry.keys()).map(k => `'${k}'`).join(', ')}`,
      index: `No enum value with index ${value}. Valid indices are: ${Array.from(indexToEntry.entries()).map(([i, e]) => `'${e.key}': ${i}`).join(', ')}`
    };
    return `[SafeEnum] ${typeMap[type]}`;
  }

  /**
   * Creates an enum value object with all required SafeEnum methods.
   * These methods are available on individual enum values (e.g., Status.PENDING.isEqual())
   * 
   * @param key - The enum key (e.g., 'PENDING')
   * @param value - The enum value (e.g., 'pending')
   * @param index - The enum index (e.g., 0)
   * @returns A properly typed SafeEnum value with all required methods
   */
  function createEnumValue(key: string, value: string, index: number): SafeEnum {
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
    isEnumValue: (val: unknown): val is SafeEnum => {
      if (!val || typeof val !== 'object') return false;
      const v = val as Record<string, unknown>;
      return (
        typeof v.key === 'string' &&
        typeof v.value === 'string' &&
        typeof v.index === 'number' &&
        Object.prototype.hasOwnProperty.call(v, 'key') &&
        Object.prototype.hasOwnProperty.call(v, 'value') &&
        Object.prototype.hasOwnProperty.call(v, 'index')
      );
    },
    
    // Instance method - compares against this enum value
    isEqual: function(this: SafeEnum, other: SafeEnum | SafeEnum[]): boolean {
      if (!other) return false;
      const others = Array.isArray(other) ? other : [other];
      return others.some(item => 
        item && 
        typeof item === 'object' && 
        'value' in item && 
        'key' in item &&
        'index' in item &&
        item.value === this.value &&
        item.key === this.key &&
        item.index === this.index
      );
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
    Key(): string {
      if (!key) {
        throw new Error(`Key is undefined for enum value: ${value}`);
      }
      return key;
    },
      
    Value(): string {
      if (!value) {
          throw new Error(`Value is undefined for enum value: ${key}`);
        }
        return value;
    },
      
    Index(): number {
      if (index === undefined) {
        throw new Error(`Index is undefined for enum value: ${key}`);
      }
      return index;
    },
      
    // Iterator support
    [Symbol.iterator]: function* () {
      for (const val of Object.values(enumValues)) {
        yield val;
      }
    },
      
    // Collection methods
    keys: () => Object.keys(enumValues),
    values: () => Object.values(enumValues).map(e => e.value),
    indexes: () => Object.values(enumValues).map(e => e.index).filter((i): i is number => i !== undefined),
    entries: () => Object.entries(enumValues) as [string, SafeEnum][],
    getEntries: () => Object.values(enumValues)
    };

    // Make the enum value immutable
    return Object.freeze(enumValue) as SafeEnum;
  }

  // Create all enum values
  for (const [key, { value, index }] of Object.entries(enumMap)) {
    if (index === undefined) {
      throw new Error(`Missing index for enum key: ${key}`)
    }
    const enumValue = createEnumValue(key, value, index)
    // Store for fast lookups
    valueToEntry.set(value, enumValue)
    indexToEntry.set(index, enumValue)
    keyToEntry.set(key, enumValue)
    enumValues[key] = enumValue
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
        console.error(createErrorMessage('index', index));
      }
      return result;
    },
    
    fromValue: (value: string): SafeEnum | undefined => {
      const result = valueToEntry.get(value);
      if (!result) {
        console.error(createErrorMessage('value', value));
      }
      return result;
    },
    
    fromKey: (key: string): SafeEnum | undefined => {
      const result = keyToEntry.get(key);
      if (!result) {
        console.error(createErrorMessage('key', key));
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
    
    // Static method - checks if all values in the array are equal to each other
    isEqual: (other: SafeEnum | SafeEnum[]): boolean => {
      if (!other) return false;
      const others = Array.isArray(other) ? other : [other];
      if (others.length === 0) return false;
      
      const first = others[0];
      if (!first || typeof first !== 'object') return false;
      
      return others.every(item => 
        item && 
        typeof item === 'object' &&
        'value' in item && 
        'key' in item &&
        'index' in item &&
        item.value === first.value &&
        item.key === first.key &&
        item.index === first.index
      );
    },
    
    // Collection methods - return information about all enum values
    keys: () => Object.keys(enumValues),
    values: () => Object.values(enumValues).map(e => e.value),
    indexes: () => Object.values(enumValues).map(e => e.index).filter((i): i is number => i !== undefined),
    entries: () => Object.entries(enumValues) as [string, SafeEnum][],
    getEntries: () => Object.values(enumValues),
    
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
      
      // For static method, check if all values are the same as the first one
      const first = others[0];
      if (!first || typeof first !== 'object') return false;
      
      return others.every(item => 
        item && 
        typeof item === 'object' &&
        'value' in item &&
        'key' in item &&
        'index' in item &&
        item.value === first.value &&
        item.key === first.key &&
        item.index === first.index
      );
    },
    // Type property for type extraction
    get Type(): EnumValueType {
      // This is a type-only property, the actual value doesn't matter at runtime
      return Object.values(enumValues)[0]?.value as any;
    },
    // Add iterator support to the enum object
    // This allows using the enum in for...of loops and spread operations
    [Symbol.iterator]: function* () {
      for (const value of Object.values(enumValues)) {
        yield value;
      }
    }
  })

  // Get all enum values for the Type property
  const enumValueTypes = Object.values(enumValues).map(e => e.value);
  type EnumValueType = typeof enumValueTypes[number];

  // Create the factory object using createEnumValue which already includes all SafeEnumObject methods
  const factory = Object.freeze({
    ...enumObject,
    Type: enumValueTypes[0] // First enum value as the Type
  } as const);

  return factory as unknown as { [K in keyof T]: SafeEnum } & SafeEnumObject<string>;
}

/**
 * Creates a SafeEnum from an array of string literals.
 * 
 * Each string in the input array becomes an enum member with:
 * - Key: Uppercased string (e.g., 'pending' -> 'PENDING')
 * - Value: Original string
 * - Index: Position in the array (0-based)
 *
 * @example
 * ```typescript
 * const Status = CreateSafeEnumFromArray(["pending", "approved", "rejected"] as const);
 * Status.PENDING.value; // "pending"
 * Status.fromValue("pending") === Status.PENDING; // true
 * Status.fromIndex(0) === Status.PENDING; // true
 * ```
 *
 * @param values Array of string literals
 * @returns A type-safe enum object with keys derived from the input array
 */
export function CreateSafeEnumFromArray<T extends readonly string[]>(
  values: T
): { [K in T[number] as Uppercase<K & string>]: SafeEnum } & SafeEnumObject {
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
