import type { SafeEnum, SafeEnumBase } from "./types/interfaces/safe-enum"

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
export function CreateSafeEnum<T extends Record<string, SafeEnumBase>>(
  enumMap: T
): { [K in keyof T]: SafeEnum } & SafeEnum {
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

  // Helper to create an enum value with proper typing
  function createEnumValue(key: string, value: string, index: number): SafeEnum {
    // Validate that value is not an empty string
    if (value === '') {
      throw new Error(`Enum value cannot be an empty string for key: ${key}`);
    }
    // Validate that index is not zero
    if (index < 0) {
      throw new Error(`Enum index cannot be less than zero for key: ${key}`);
    }
    if (key === '') {
      throw new Error(`Enum key cannot be an empty string for value: ${value}`);
    }
    const enumValue: SafeEnum = {
      key,
      value,
      index,
      fromIndex: (num: number) => {
        const result = indexToEntry.get(num);
        if (!result) {
          const validIndices = Object.entries(enumMap)
            .map(([k, v]) => `'${k}': ${v.index}`)
            .join(', ');
          console.error(`[SafeEnum] No enum value with index ${num}. Valid indices are: ${validIndices}`);
          return undefined;
        }
        return result;
      },
      fromValue: (str: string) => {
        const result = valueToEntry.get(str);
        if (!result) {
          const validValues = Object.values(enumMap).map(v => `'${v.value}'`).join(', ');
          console.error(`[SafeEnum] No enum value with value '${str}'. Valid values are: ${validValues}`);
          return undefined;
        }
        return result;
      },
      fromKey: (k: string) => {
        const result = keyToEntry.get(k);
        if (!result) {
          const validKeys = Object.keys(enumMap).map(key => `'${key}'`).join(', ');
          console.error(`[SafeEnum] No enum value with key '${k}'. Valid keys are: ${validKeys}`);
          return undefined;
        }
        return result;
      },
      // Instance methods - check against current enum value
      hasValue: (val: string) => value === val,
      hasKey: (k: string) => key === k,
      hasIndex: (idx: number) => index === idx,
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
      isEqual: (other: SafeEnum | SafeEnum[]): boolean => {
        if (!other) return false;
        const others = Array.isArray(other) ? other : [other];
        return others.some(item => 
          item && 
          typeof item === 'object' && 
          'value' in item && 
          'key' in item &&
          'index' in item &&
          item.value === value &&
          item.key === key &&
          item.index === index
        );
      },
      toString(): string {
        return `${key}: (${value}), index: ${index}`;
      },
      toJSON() {
        return {
          key,
          value,
          index
        };
      },
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
      keys: () => Object.keys(enumValues),
      values: () => Object.values(enumValues).map(e => e.value),
      indexes: () => Object.values(enumValues).map(e => e.index).filter((i): i is number => i !== undefined),
      entries: () => Object.entries(enumValues) as [string, SafeEnum][],
      getEntries: () => Object.values(enumValues),
      [Symbol.iterator]: function* () {
        for (const value of Object.values(enumValues)) {
          yield value;
        }
      },
      get typeOf() {
        // This is a type-only property, the actual value doesn't matter at runtime
        return Object.values(enumValues)[0]?.value as any;
      }
    }

    // Store for fast lookups
    valueToEntry.set(value, enumValue)
    indexToEntry.set(index, enumValue)
    keyToEntry.set(key, enumValue)
    enumValues[key] = enumValue

    return Object.freeze(enumValue)
  }

  // Create all enum values
  for (const [key, { value, index }] of Object.entries(enumMap)) {
    if (index === undefined) {
      throw new Error(`Missing index for enum key: ${key}`)
    }
    createEnumValue(key, value, index)
  }

  // Static methods - check against entire enum
  function hasValue(value: string): boolean {
    return valueToEntry.has(value);
  }

  // Returns true if the enum contains the specified key
  function hasKey(key: string): boolean {
    return key in enumValues;
  }

  // Returns true if the enum contains the specified index
  function hasIndex(index: number): boolean {
    return indexToEntry.has(index);
  }

  // Factory methods with safe variants only
  // Lookup by index
  function fromIndex(index: number): SafeEnum | undefined {
    const result = indexToEntry.get(index)
    if (!result) {
      const validIndices = Object.entries(enumMap)
        .map(([k, v]) => `'${k}': ${v.index}`)
        .join(', ')
      console.error(`[SafeEnum] No enum value with index ${index}. Valid indices are: ${validIndices}`)
    }
    return result
  }

  // Lookup by value (string)
  function fromValue(value: string): SafeEnum | undefined {
    const result = valueToEntry.get(value)
    if (!result) {
      const validValues = Object.values(enumMap).map(v => `'${v.value}'`).join(', ')
      console.error(`[SafeEnum] No enum value with value '${value}'. Valid values are: ${validValues}`)
    }
    return result
  }

  // Lookup by key
  function fromKey(key: string): SafeEnum | undefined {
    const result = keyToEntry.get(key)
    if (!result) {
      const validKeys = Object.keys(enumMap).map(k => `'${k}'`).join(', ')
      console.error(`[SafeEnum] No enum value with key '${key}'. Valid keys are: ${validKeys}`)
    }
    return result
  }

  function isEnumValue(value: unknown): value is SafeEnum {
    if (!value || typeof value !== "object") return false

    const val = value as Record<string, unknown>
    const key = val["key"]
    const valueProp = val["value"]
    const index = val["index"]

    if (typeof key !== "string" || typeof valueProp !== "string" || typeof index !== "number") {
      return false
    }

    const entry = keyToEntry.get(key)
    return !!entry && entry.value === valueProp && entry.index === index
  }

  // Compares enum values for equality
  function isEqual(other: SafeEnum | SafeEnum[]): boolean {
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
  }

  // Create a base object with the enum values
  const base = {
    ...enumValues
  };

  // Get all enum values for the Type property
  const enumValueTypes = Object.values(enumValues).map(e => e.value);
  type EnumValueType = typeof enumValueTypes[number];

  // Create the factory object with proper typing
  const factory = {
    // Add methods to the factory
    fromIndex,
    fromValue,
    fromKey,
    hasValue,
    hasKey,
    hasIndex,
    isEnumValue,
    isEqual,
    keys: () => Object.keys(enumValues),
    getEntries: () => Object.values(enumValues),
    values: () => Object.values(enumValues).map(e => e.value),
    indexes: () => Object.values(enumValues).map(e => e.index),
    entries: () => Object.entries(enumValues) as [string, SafeEnum][],
    // Type property for type extraction
    get Type(): EnumValueType {
      // This is a type-only property, the actual value doesn't matter at runtime
      return '' as EnumValueType;
    },
    [Symbol.iterator]: () => Object.values(enumValues)[Symbol.iterator](),
    // Add enum values as properties
    ...base
  } as unknown as { [K in keyof T]: SafeEnum } & SafeEnum & { Type: EnumValueType }

  return Object.freeze(factory)
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
): { [K in T[number] as Uppercase<K & string>]: SafeEnum } & SafeEnum {
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

  return CreateSafeEnum(enumMap) as unknown as { [K in T[number] as Uppercase<K & string>]: SafeEnum } & SafeEnum;
}
