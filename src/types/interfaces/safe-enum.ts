// Base interface for enum values passed to CreateSafeEnum
export interface SafeEnumBase {
  readonly value: string;
  // Made optional to support createFromArray
  readonly key?: string;
  readonly index?: number; // Made optional to support auto-indexing
}
/**
 * Type utility to extract the type of enum values
 */
export type EnumType<T extends { [key: string]: { value: string } }> = T[keyof T]['value'];

/**
 * The SafeEnum type represents a type-safe enum value with lookup methods.
 * Each enum value has a key, value, and index, along with utility methods.
 * 
 * @example
 * ```typescript
 * // Simple usage with type export
 * const Status = CreateSafeEnum({
 *   PENDING: { value: 'pending', index: 0 },
 *   APPROVED: { value: 'approved', index: 1 },
 *   REJECTED: { value: 'rejected', index: 2 }
 * } as const);
 * 
 * // Usage:
 * const status: Status = Status.PENDING
 * console.log(status.value); // 'pending'
 * 
 * // Advanced usage with explicit type export
 * export const RequestType = CreateSafeEnum({
 *   POST: { value: 'POST', index: 0 },
 *   GET: { value: 'GET', index: 1 },
 *   // ...
 * } as const);
 * // This will work with the updated types
 * export type RequestType = SafeEnum
 * 
 * // Usage:
 * const method: RequestType = RequestType.fromKey(postString);
 * console.log(method.value); // 'POST'
 * ```
 */
// Interface for enum value instances
export interface SafeEnum extends SafeEnumBase {
  /** The string key of the enum value (e.g., 'PENDING') */
  readonly key: string;
  
  /** The string value of the enum (e.g., 'pending') */
  readonly value: string;
  
  /** The numeric index of the enum */
  readonly index: number;
  
    //#region Instance Methods
  // These methods are available on enum value instances
  
  //#region Type guards
  /**
   * Checks if this enum value has the given value
   * @param value The value to check against this enum value
   * @returns true if the values match, false otherwise
   */
  hasValue(value: string): boolean;
  
  /**
   * Checks if this enum value has the given key
   * @param key The key to check against this enum value
   * @returns true if the keys match, false otherwise
   */
  hasKey(key: string): boolean;
  
  /**
   * Checks if this enum value has the given index
   * @param index The index to check against this enum value
   * @returns true if the indices match, false otherwise
   */
  hasIndex(index: number): boolean;
  
  /**
   * Type guard to check if the given value is an enum value
   * @param value The value to check
   * @returns true if the value is an enum value, false otherwise
   */
  isEnumValue(value: unknown): value is SafeEnum;
  //#endregion
  
  //#region Comparison
  /**
   * Checks if the given enum value or array of values matches this enum value
   * @param other The value or array of values to compare with
   * @returns true if the values match, false otherwise
   */
  isEqual(other: SafeEnum | SafeEnum[]): boolean;
  //#endregion
  
  //#region String representation
  /**
   * Returns a string representation of the enum value
   * @returns "key: value, index: index"
   */
  toString(): string;
  
  /**
   * Returns a JSON representation of the enum value
   * @returns A JSON representation of the enum value
   */
  toJSON(): { key: string; value: string; index: number };
  //#endregion
  
  //#region Getters
  /**
   * Returns the key of the enum value or throws if undefined
   * @returns The enum key as a string
   */
  Key(): string;
  
  /**
   * Returns the value of the enum or throws if undefined
   * @returns The enum value as a string
   */
  Value(): string;
  
  /**
   * Returns the index of the enum or throws if undefined
   * @returns The enum index as a number
   */
  Index(): number;
  //#endregion
}

// Interface for the enum object (static methods)
export interface SafeEnumObject<T extends string = string> {
  // Enum values
  [key: string]: SafeEnum | ((...args: any[]) => any);
  
  // Factory methods
  fromValue(value: string): SafeEnum | undefined;
  fromKey(key: string): SafeEnum | undefined;
  fromIndex(index: number): SafeEnum | undefined;
  
  // Type guards
  isEnumValue(value: unknown): value is SafeEnum;
  
  // Collection methods
  keys(): string[];
  values(): string[];
  indexes(): number[];
  entries(): [string, SafeEnum][];
  getEntries(): SafeEnum[];
  
  // Iterator support
  [Symbol.iterator](): IterableIterator<SafeEnum>;
  
  //#region Type guards
  /**
   * Checks if the given value exists in the enum
   * @param value The value to search for
   * @returns true if the value exists, false otherwise
   */
  hasValue(value: string): boolean;
  
  /**
   * Checks if the given key exists in the enum
   * @param key The key to search for
   * @returns true if the key exists, false otherwise
   */
  hasKey(key: string): boolean;
  
  /**
   * Checks if the given index exists in the enum
   * @param index The index to search for
   * @returns true if the index exists, false otherwise
   */
  hasIndex(index: number): boolean;
  
  /**
   * Type guard to check if the given value is an enum value
   * @param value The value to check
   * @returns true if the value is an enum value, false otherwise
   */
  isEnumValue(value: unknown): value is SafeEnum;
  //#endregion
  
  //#region Comparison
  /**
   * Checks if the given enum value or array of values matches this enum value
   * @param other The value or array of values to compare with
   * @returns true if the values match, false otherwise
   */
  isEqual(other: SafeEnum | SafeEnum[]): boolean;
  //#endregion
  
  //#region String representation
  /**
   * Returns a string representation of the enum value
   * @returns "key: value, index: index"
   */
  toString(): string;
  /**
   * Returns a JSON representation of the enum value
   * @returns A JSON representation of the enum value
   * @example {
          key: 'FOO',
          value: 'foo',
          index: 0
        }
   */
  toJSON(): { key: string; value: string; index: number };
  //#endregion
  
  //#region Collection methods
  /**
   * Returns an array of all enum keys
   * @example
   * const statusKeys = Status.keys(); // ['PENDING', 'APPROVED', 'REJECTED']
   */
  keys(): string[];
  
  /**
   * Returns an array of all enum values
   * @example
   * const statusValues = Status.values(); // ['pending', 'approved', 'rejected']
   */
  values(): string[];
  
  /**
   * Returns an array of all enum indexes
   * @example
   * const statusIndexes = Status.indexes(); // [0, 1, 2]
   */
  indexes(): number[];
  
  /**
   * Returns an array of all enum entries as [key, value] pairs
   * @example
   * const statusEntries = Status.entries(); // [['PENDING', 'pending'], ['APPROVED', 'approved'], ['REJECTED', 'rejected']]
   */
  entries(): [string, SafeEnum][];
  
  /**
   * Returns an array of all enum values as full objects
   * @example
   * const statusEntries = Status.getEntries(); // [{ key: 'PENDING', value: 'pending', index: 0 }, { key: 'APPROVED', value: 'approved', index: 1 }, { key: 'REJECTED', value: 'rejected', index: 2 }]
   */
  getEntries(): SafeEnum[];
  
  /**
   * Returns the key of the enum value or Throws if undefined
   * @example
   * const statusKey = Status.PENDING.Key(); // 'PENDING'
   */
  Key(): string;
  
  /**
   * Returns the value of the enum or Throws if undefined
   * @example
   * const statusValue = Status.PENDING.Value(); // 'pending'
   */
  Value(): string;
  
  /**
   * Returns the index of the enum or Throws if undefined
   * @example
   * const statusIndex = Status.PENDING.Index(); // 0
   */
  Index(): number;
  
  //#region Iterator
  [Symbol.iterator](): IterableIterator<SafeEnum>;
  //#endregion
  
  //#region Type information
  /**
   * Returns an array of all enum values
   * @example
   * const statusValues = Status.values(); // ['pending', 'approved', 'rejected']
   */
  values(): string[];
  //#endregion
}
