// Base interface for enum values passed to CreateSafeEnum
export interface SafeEnumBase {
  readonly value: string
  index?: number
}

// Type helper to extract literal types from an enum map
export type SafeEnumValue<T extends Record<string, SafeEnumBase>> = {
  [K in keyof T]: {
    readonly key: K & string
    readonly value: T[K]["value"]
    readonly index: T[K]["index"] extends number ? T[K]["index"] : number
    isEqual(other: SafeEnumValue<T> | SafeEnumValue<T>[]): boolean
  }
}[keyof T]

export type SafeEnumWithMembers<T extends Record<string, SafeEnumBase>> = SafeEnum<T> & { [K in keyof T]: SafeEnumValue<T> };

/**
 * SafeEnum is an interface that represents a type-safe enum with runtime validation.
 * SafeEnums are created using the CreateSafeEnum function.
 *
 * @example
 * ```typescript
 * // Basic usage with auto-indexing
 * const Status = CreateSafeEnum({
 *   PENDING: { value: 'pending' },     // index: 0
 *   APPROVED: { value: 'approved' },   // index: 1
 *   REJECTED: { value: 'rejected' }    // index: 2
 * } as const);
 *
 * // Mixed explicit and auto-indexing
 * const MixedEnum = CreateSafeEnum({
 *   FIRST: { value: 'first', index: 10 },  // explicit index
 *   SECOND: { value: 'second' },           // auto-assigned: 11
 *   THIRD: { value: 'third', index: 20 },  // explicit index
 *   FOURTH: { value: 'fourth' }            // auto-assigned: 21
 * } as const);
 *
 * // Type-safe access
 * type StatusType = SafeEnumValue<typeof Status>;
 * const status1: StatusType = Status.PENDING;  // { key: 'PENDING', value: 'pending', index: 0 }
 *
 * // Lookup methods (all return undefined for invalid inputs)
 * const fromNumber = Status.fromNumber(0);     // Status.PENDING
 * const fromString = Status.fromString('approved'); // Status.APPROVED
 * const fromKey = Status.fromKey('REJECTED');  // Status.REJECTED
 *
 * // Type guard
 * if (Status.isEnumValue(someValue)) {
 *   // someValue is properly typed as StatusType here
 * }
 *
 * // Get all values
 * const allStatuses = Status.values();
 *
 * // Type narrowing with isEqual
 * if (Status.PENDING.isEqual(someValue)) {
 *   // someValue is narrowed to Status.PENDING
 * }
 *
 * // Compare with multiple values
 * const isPendingOrApproved = Status.PENDING.isEqual([
 *   Status.PENDING,
 *   Status.APPROVED
 * ]); // true
 *
 * // Export pattern
 * export type Status = SafeEnumValue<typeof Status>;
 * export { Status as StatusEnum } from './path-to-enum';
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SafeEnum<T extends Record<string, SafeEnumBase> = any> {
  /**
   * Gets an enum value by its index.
   * @param index The index to look up.
   * @returns The specific enum value if found, otherwise undefined.
   */
  fromIndex<N extends number>(index: N): Extract<SafeEnumValue<T>, { index: N }> | undefined

  /**
   * Checks if the enum contains a specific string value.
   * @param value The string value to look up.
   * @returns true if the value is found, otherwise false.
   */
  hasValue(value: string): boolean

  /**
   * Checks if the enum contains a specific key.
   * @param key The key to look up.
   * @returns true if the key is found, otherwise false.
   */
  hasKey(key: string): boolean

  /**
   * Checks if the enum contains a specific index.
   * @param index The index to look up.
   * @returns true if the index is found, otherwise false.
   */
  hasIndex(index: number): boolean

  /**
   * Gets an enum value by its value property (string).
   * @param value The string value to look up.
   * @returns The specific enum value if found, otherwise undefined.
   */
  fromValue<S extends string>(value: S): Extract<SafeEnumValue<T>, { value: S }> | undefined

  /**
   * Gets an enum value by its key.
   * @param key The key to look up.
   * @returns The specific enum value if found, otherwise undefined.
   */
  fromKey<K extends keyof T & string>(key: K): Extract<SafeEnumValue<T>, { key: K }> | undefined

  /**
   * Checks if this enum value equals another value or any value in an array.
   *
   * @example
   * ```typescript
   * // Single value comparison
   * Status.PENDING.isEqual(Status.PENDING); // true
   *
   * // Array comparison (OR operation)
   * Status.PENDING.isEqual([Status.PENDING, Status.APPROVED]); // true
   * Status.PENDING.isEqual([Status.REJECTED, Status.APPROVED]); // false
   *
   * // TypeScript will enforce type safety
   * Status.PENDING.isEqual(OtherEnum.KEY); // Type error
   * ```
   *
   * @param other - The value or array of values to compare against.
   * @returns true if this value equals any of the provided values.
   */
  isEqual(other: SafeEnumValue<T> | SafeEnumValue<T>[]): boolean

  /**
   * Returns all enum values as an array.
   */
  values(): SafeEnumValue<T>[]

  /**
   * Type guard to check if a value is a valid enum value.
   * @param value The value to check.
   * @returns true if the value is a valid enum value.
   */
  isEnumValue(value: unknown): value is SafeEnumValue<T>

  /**
   * Returns an array of all enum keys.
   * @returns An array of string literal types representing the enum keys.
   */
  keys(): (keyof T & string)[]

  /**
   * Returns an array of [key, value] pairs for all enum entries.
   * @returns An array of tuples containing the key and value for each enum entry.
   */
  entries(): [keyof T & string, SafeEnumValue<T>][]
}
