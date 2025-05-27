import type { SafeEnum, SafeEnumBase, SafeEnumValue } from "./types/interfaces/safe-enum"


/**
 * Converts an array of strings into an enum map with uppercase keys and numeric indices.
 *
 * Each string in the input array becomes an enum member with the key as the uppercased string,
 * the value as the original string, and the index as its position in the array.
 *
 * @param values Array of string values to convert to an enum map.
 * @returns Enum map suitable for SafeEnum creation.
 *
 * @example
 * convertToEnumMap(["pending", "approved"])
 * // => { PENDING: { value: "pending", index: 0 }, APPROVED: { value: "approved", index: 1 } }
 */
function convertToEnumMap(values: string[]): Record<string, SafeEnumBase> {
  const enumMap: Record<string, SafeEnumBase> = {}
  values.forEach((value, index) => {
    enumMap[value.toUpperCase()] = { value, index }
  })
  return enumMap
}

/**
 * Creates a SafeEnum from an array or tuple of string literals.
 *
 * Each string in the input array becomes an enum member with the key as the uppercased string,
 * the value as the original string, and the index as its position in the array.
 *
 * The resulting enum supports all SafeEnum methods (fromString, fromNumber, isEqual, keys, entries, etc.)
 * and is fully type-safe.
 *
 * @example
 * ```typescript
 * const Status = CreateSafeEnumFromArray(["pending", "approved", "rejected"] as const);
 * Status.PENDING.value; // "pending"
 * Status.fromValue("pending") === Status.PENDING; // true
 * Status.fromIndex(0) === Status.PENDING; // true
 * Status.PENDING.isEqual(Status.fromValue("pending")); // true
 * Status.keys(); // ["PENDING", "APPROVED", "REJECTED"]
 * ```
 *
 * // For type safety
 * export type Status = SafeEnumValue<typeof Status>;
 */
import type { SafeEnumWithMembers } from "./types/interfaces/safe-enum"

export function CreateSafeEnumFromArray<
  T extends readonly string[]
>(values: T): SafeEnumWithMembers<{ [K in Uppercase<T[number]>]: { value: Extract<T[number], string>, index: number } }> {
  // Build enum map with uppercase keys
  const enumMap = (values as readonly string[]).reduce<Record<string, { value: string; index: number }>>((acc, value, idx) => {
    acc[value.toUpperCase()] = { value, index: idx };
    return acc;
  }, {});
  return CreateSafeEnum(enumMap) as SafeEnumWithMembers<{ [K in Uppercase<T[number]>]: { value: Extract<T[number], string>, index: number } }>;
}

/**
 * Creates a type-safe enum from a given enum map
 *
 * @example
 * ```typescript
 * const enumMap = {
 *   FOO: { value: "foo", index: 0 },
 *   BAR: { value: "bar", index: 1 }
 * } as const;
 *
 * export type MyEnum = SafeEnumValue<typeof enumMap>;
 * export const MyEnum = CreateSafeEnum(enumMap);
 * ```
 *
 * @typeParam T - The type of the enum map (inferred)
 * @param enumMap - The enum map defining the enum values
 * @returns A type-safe enum object with lookup methods
 */
export function CreateSafeEnum<T extends Record<string, SafeEnumBase>>(
  enumMap: T
): SafeEnum<T> & { [K in keyof T]: SafeEnumValue<T> } {
  // Make all existing indexes immutable and collect used indexes
  const usedIndexes = new Set<number>()

  // Process each enum value to ensure proper indexing
  Object.entries(enumMap).forEach(([key, obj]) => {
    // Ensure value is immutable
    if (!Object.getOwnPropertyDescriptor(obj, "value")?.writable) {
      Object.defineProperty(obj, "value", {
        value: obj.value,
        writable: false,
        configurable: false,
        enumerable: true
      })
    }

    // Handle index assignment if not provided
    if (obj.index === undefined) {
      let nextIndex = 0
      while (usedIndexes.has(nextIndex)) nextIndex++
      Object.defineProperty(obj, "index", {
        value: nextIndex,
        writable: false,
        configurable: false,
        enumerable: true
      })
      usedIndexes.add(nextIndex)
    } else if (!usedIndexes.has(obj.index)) {
      // Only add the index if it's not a duplicate
      Object.defineProperty(obj, "index", {
        value: obj.index,
        writable: false,
        configurable: false,
        enumerable: true
      })
      usedIndexes.add(obj.index)
    } else {
      // Find the conflicting key for better error reporting
      const conflictingKey = Object.entries(enumMap).find(
        ([k, v]) => v.index === obj.index && k !== key
      )?.[0]

      throw new Error(
        `Duplicate index ${obj.index} found in enum map: ` +
          `'${key}' conflicts with '${conflictingKey || "unknown"}'`
      )
    }
  })
  // Create a map from value to enum entry for faster lookups
  const valueToEntry = new Map<string, SafeEnumValue<T>>()
  const indexToEntry = new Map<number, SafeEnumValue<T>>()

  // Helper to create an enum value with proper typing
  function createEnumValue(key: string, value: string, index: number): SafeEnumValue<T> {
    const enumValue = {
      key,
      value,
      index,
      isEqual(other: SafeEnumValue<T> | SafeEnumValue<T>[]): boolean {
        if (!other) return false
        const others = Array.isArray(other) ? other : [other]
        return others.some((item) => item.value === value)
      }
    } as SafeEnumValue<T>

    // Store for fast lookups
    valueToEntry.set(value, enumValue)
    indexToEntry.set(index, enumValue)

    return Object.freeze(enumValue)
  }

  // Create all enum values
  const entries = Object.entries(enumMap).map(([key, { value, index }]) => {
    if (index === undefined) {
      throw new Error(`Missing index for enum key: ${key}`)
    }
    return [key, createEnumValue(key, value, index)] as const
  })

  // Create the enum map
  const enumValues = Object.fromEntries(entries) as { [K in keyof T]: SafeEnumValue<T> }

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
  // Canonical: Lookup by index
  function fromIndex<N extends number>(
    index: N
  ): Extract<SafeEnumValue<T>, { index: N }> | undefined {
    return indexToEntry.get(index) as Extract<SafeEnumValue<T>, { index: N }> | undefined
  }

  // Canonical: Lookup by value (string)
  function fromValue<S extends string>(
    value: S
  ): Extract<SafeEnumValue<T>, { value: S }> | undefined {
    return valueToEntry.get(value) as Extract<SafeEnumValue<T>, { value: S }> | undefined
  }

  // Lookup by key
  function fromKey<K extends keyof T & string>(
    key: K
  ): Extract<SafeEnumValue<T>, { key: K }> | undefined {
    return (key in enumValues ? enumValues[key] : undefined) as
      | Extract<SafeEnumValue<T>, { key: K }>
      | undefined
  }

  function isEnumValue(value: unknown): value is SafeEnumValue<T> {
    if (!value || typeof value !== "object") return false

    const val = value as Record<string, unknown>
    const key = val["key"]

    return (
      typeof key === "string" &&
      typeof val["value"] === "string" &&
      typeof val["index"] === "number" &&
      key in enumValues &&
      enumValues[key as keyof T]?.value === val["value"] &&
      enumValues[key as keyof T]?.index === val["index"]
    )
  }

  const enumValuesArray = Object.values(enumValues)

  // Compares this enum value with another value or array of values
  function isEqual(other: SafeEnumValue<T> | SafeEnumValue<T>[]): boolean {
    if (!other) return false
    const values = Array.isArray(other) ? other : [other]
    if (values.length === 0) return false

    const firstValue = values[0]?.value
    return values.every((value) => value?.value === firstValue)
  }

  // Create the factory object with all methods and values
  const factory = {
    ...enumValues,
    fromValue,
    fromIndex,
    fromKey,
    isEnumValue,
    isEqual,
    hasValue,
    hasKey,
    hasIndex,
    values: () => [...enumValuesArray],
    keys: () => Object.keys(enumValues) as (keyof T & string)[],
    entries: () => Object.entries(enumValues) as [keyof T & string, SafeEnumValue<T>][],
    [Symbol.iterator]: function* () {
      for (const value of enumValuesArray) {
        yield value
      }
    }
  } as const as unknown as SafeEnum<T> & { [K in keyof T]: SafeEnumValue<T> }

  return Object.freeze(factory)
}
