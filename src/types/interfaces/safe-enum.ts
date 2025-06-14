// Base interface for enum values passed to CreateSafeEnum
export interface SafeEnumBase {
  readonly value: string;
  readonly index?: number; // Made optional to support auto-indexing
}

/**
 * The SafeEnum type represents a type-safe enum value with lookup methods.
 * Each enum value has a key, value, and index, along with utility methods.
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
 */
export interface SafeEnum {
  /** The string key of the enum value (e.g., 'PENDING') */
  readonly key: string;
  
  /** The string value of the enum (e.g., 'pending') */
  readonly value: string;
  
  /** 
   * The numeric index of the enum.
   * This is optional and will be auto-assigned if not provided.
   */
  readonly index?: number;
  
  /**
   * Gets an enum value by its index
   * @param num The index to look up
   * @returns The matching enum value or undefined if not found
   */
  fromIndex(num: number): SafeEnum | undefined;
  
  /**
   * Gets an enum value by its string value
   * @param str The string value to look up
   * @returns The matching enum value or undefined if not found
   */
  fromValue(str: string): SafeEnum | undefined;
  
  /**
   * Gets an enum value by its key
   * @param key The key to look up (case-sensitive)
   * @returns The matching enum value or undefined if not found
   */
  fromKey(key: string): SafeEnum | undefined;
  
  /**
   * Checks if a value exists in the enum
   * @param value The value to check
   * @returns true if the value exists in the enum, false otherwise
   */
  hasValue(value: string): boolean;
  
  /**
   * Checks if a key exists in the enum
   * @param key The key to check
   * @returns true if the key exists in the enum, false otherwise
   */
  hasKey(key: string): boolean;
  
  /**
   * Checks if an index exists in the enum
   * @param index The index to check
   * @returns true if the index exists in the enum, false otherwise
   */
  hasIndex(index: number): boolean;
  
  /**
   * Type guard to check if a value is a valid enum value
   * @param value The value to check
   * @returns true if the value is a valid enum value, false otherwise
   */
  isEnumValue(value: unknown): value is SafeEnum;
  
  /**
   * Compares this enum value with another value or array of values
   * @param other The value or array of values to compare with
   * @returns true if this value matches any of the provided values
   */
  isEqual(other: SafeEnum | SafeEnum[]): boolean;
  
  /**
   * Returns a string representation of the enum value
   * @returns A string in the format "KEY: (value), index: N"
   */
  toString(): string;
  
  /**
   * Converts the enum value to a JSON-safe object
   * @returns A plain object with the enum's key, value, and index
   */
  toJSON(): { key: string; value: string; index: number };
  
  /**
   * Returns an array of all enum keys
   * @returns An array of string keys for all enum values
   */
  keys(): string[];
  
  /**
   * Returns an array of all enum values as strings
   * @returns An array of string values from the enum
   */
  values(): string[];
  
  /**
   * Returns an array of all enum indices
   * @returns An array of numbers representing the indices
   */
  indexes(): number[];
  
  /**
   * Returns an array of [key, value] pairs
   * @returns An array of tuples containing the key and value for each enum entry
   */
  entries(): [string, SafeEnum][];
  
  /**
   * Returns an array of all enum entries (full value objects)
   * @returns An array of SafeEnum objects containing all properties
   */
  getEntries(): SafeEnum[];
  
  /**
   * Allows iteration over enum values
   */
  [Symbol.iterator](): IterableIterator<SafeEnum>;
}
