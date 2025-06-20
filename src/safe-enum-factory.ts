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
export function CreateSafeEnum(
  enumMap: Record<string, SafeEnumBase>
): SafeEnum & { [key: string]: SafeEnum } {
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
    const enumValue: SafeEnum = {
      key,
      value,
      index,
      fromIndex: (num: number) => {
        const result = indexToEntry.get(num)
        if (!result) {
          const validIndices = Object.entries(enumMap)
            .map(([k, v]) => `'${k}': ${v.index}`)
            .join(', ')
          console.error(`[SafeEnum] No enum value with index ${num}. Valid indices are: ${validIndices}`)
          return undefined
        }
        return result
      },
      fromValue: (str: string) => {
        const result = valueToEntry.get(str)
        if (!result) {
          const validValues = Object.values(enumMap).map(v => `'${v.value}'`).join(', ')
          console.error(`[SafeEnum] No enum value with value '${str}'. Valid values are: ${validValues}`)
          return undefined
        }
        return result
      },
      fromKey: (k: string) => {
        const result = keyToEntry.get(k)
        if (!result) {
          const validKeys = Object.keys(enumMap).map(key => `'${key}'`).join(', ')
          console.error(`[SafeEnum] No enum value with key '${k}'. Valid keys are: ${validKeys}`)
          return undefined
        }
        return result
      },
      hasValue: (val: string) => valueToEntry.has(val),
      hasKey: (k: string) => keyToEntry.has(k),
      hasIndex: (idx: number) => indexToEntry.has(idx),
      isEnumValue: (val: unknown): val is SafeEnum => {
        if (!val || typeof val !== 'object') return false
        const v = val as Record<string, unknown>
        return (
          typeof v.key === 'string' &&
          typeof v.value === 'string' &&
          typeof v.index === 'number' &&
          Object.prototype.hasOwnProperty.call(v, 'key') &&
          Object.prototype.hasOwnProperty.call(v, 'value') &&
          Object.prototype.hasOwnProperty.call(v, 'index')
        )
      },
      isEqual(other: SafeEnum | SafeEnum[]): boolean {
        if (!other) return false;
        const others = Array.isArray(other) ? other : [other];
        return others.some((item) => item && typeof item === 'object' && 'value' in item && item.value === value);
      },
      toString(): string {
        return `${key}: (${value}), index: ${index}`
      },
      toJSON() {
        return {
          key,
          value,
          index
        }
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

  // Returns true if the enum contains the specified value
  function hasValue(value: string): boolean {
    return valueToEntry.has(value)
  }

  // Returns true if the enum contains the specified key
  function hasKey(key: string): boolean {
    return key in enumValues
  }

  // Returns true if the enum contains the specified index
  function hasIndex(index: number): boolean {
    return indexToEntry.has(index)
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

  // Compares this enum value with another value or array of values
  function isEqual(other: SafeEnum | SafeEnum[]): boolean {
    if (!other) return false
    const values = Array.isArray(other) ? other : [other]
    if (values.length === 0) return false

    const firstValue = values[0]?.value
    return values.every((value) => value?.value === firstValue)
  }

  // Create the enum object with all methods
  const factory = {
    // Add all methods
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
    [Symbol.iterator]: () => Object.values(enumValues)[Symbol.iterator](),
    // Add enum values as properties
    ...enumValues
  } as unknown as SafeEnum & { [key: string]: SafeEnum }

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
 * @returns A type-safe enum object
 */
export function CreateSafeEnumFromArray<T extends readonly string[]>(
  values: T
) {
  // Build enum map with uppercase keys and auto-incrementing indices
  const enumMap = (values as readonly string[]).reduce<Record<string, { value: string; index: number }>>(
    (acc, value, index) => {
      acc[value.toUpperCase()] = { value, index };
      return acc;
    }, 
    {}
  );

  return CreateSafeEnum(enumMap);
}
