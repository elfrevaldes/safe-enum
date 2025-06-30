/**
 * Base interface for enum values used in CreateSafeEnum.
 * This interface defines the minimum required properties for enum values.
 * 
 * @remarks
 * This is an internal interface used by the type system. In most cases,
 * you should use the {@link SafeEnum} interface instead.
 * 
 * @property {string} value - The string value of the enum (required)
 * @property {string} [key] - The key of the enum (optional, auto-generated if not provided)
 * @property {number} [index] - The index of the enum (optional, auto-assigned if not provided)
 */
export interface SafeEnumBase {
  /** The string value of the enum (e.g., 'pending') */
  readonly value: string;
  
  /** 
   * The key of the enum (e.g., 'PENDING')
   * @remarks This is optional in the base interface but will always be present in the final SafeEnum
   */
  readonly key?: string;
  
  /** 
   * The numeric index of the enum
   * @remarks If not provided, will be auto-assigned based on declaration order
   */
  readonly index?: number;
}
/**
 * Type utility to extract the union type of all possible enum values from an enum object.
 * 
 * @template T - The type of the enum object (must have string values with a 'value' property)
 * 
 * @example
 * ```typescript
 * const HttpMethods = CreateSafeEnum({
 *   GET: { value: 'GET', index: 0 },
 *   POST: { value: 'POST', index: 1 },
 *   PUT: { value: 'PUT', index: 2 }
 * } as const);
 * 
 * // Type is 'GET' | 'POST' | 'PUT'
 * type HttpMethod = EnumType<typeof HttpMethods>;
 * 
 * // Usage in function parameters
 * function handleRequest(method: EnumType<typeof HttpMethods>) {
 *   // method is type-safe and can only be 'GET', 'POST', or 'PUT'
 * }
 * ```
 */
export type EnumType<T extends { [key: string]: { value: string } }> = T[keyof T]['value'];

/**
 * Represents a type-safe enum value with key, value, and index properties,
 * along with utility methods for comparison and type checking.
 * 
 * @remarks
 * The SafeEnum interface is the core of the type-safe enum system. Each enum value
 * is an immutable object with the following properties:
 * - `key`: The enum constant name (e.g., 'PENDING')
 * - `value`: The string value (e.g., 'pending')
 * - `index`: The numeric index (0-based)
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * // Create an enum
 * const Status = CreateSafeEnum({
 *   PENDING: { value: 'pending', index: 0 },
 *   APPROVED: { value: 'approved', index: 1 },
 *   REJECTED: { value: 'rejected', index: 2 }
 * } as const);
 * 
 * // Type-safe usage
 * const status: Status = Status.PENDING;
 * console.log(status.value);  // 'pending'
 * console.log(status.index);  // 0
 * ```
 * 
 * @example
 * ### With Explicit Type Export
 * ```typescript
 * // Create and export the enum
 * export const HttpMethod = CreateSafeEnum({
 *   GET: { value: 'GET', index: 0 },
 *   POST: { value: 'POST', index: 1 },
 *   PUT: { value: 'PUT', index: 2 },
 *   DELETE: { value: 'DELETE', index: 3 }
 * } as const);
 * 
 * // Export the type for use in other files
 * export type HttpMethod = SafeEnum;
 * 
 * // Type-safe function parameter
 * function fetchData(method: HttpMethod, url: string) {
 *   // method is guaranteed to be a valid HttpMethod
 *   console.log(`Making ${method.value} request to ${url}`);
 * }
 * 
 * // Usage
 * fetchData(HttpMethod.GET, '/api/data');
 * // fetchData('GET', '/api/data'); // Type error: string is not assignable to HttpMethod
 * ```
 * 
 * @see {@link CreateSafeEnum} - Function to create type-safe enums
 * @see {@link CreateSafeEnumFromArray} - Alternative factory for array-based enum creation
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
  getKeyOrThrow(): string;
  
  /**
   * Returns the value of the enum or throws if undefined
   * @returns The enum value as a string
   */
  getValueOrThrow(): string;
  
  /**
   * Returns the index of the enum or throws if undefined
   * @returns The enum index as a number
   */
  getIndexOrThrow(): number;
  //#endregion
}

/**
 * Represents the enum object that contains both the enum values and static methods.
 * This interface defines the shape of the object returned by {@link CreateSafeEnum}.
 * 
 * @remarks
 * The SafeEnumObject serves as both a namespace for enum values and a container for
 * static methods that operate on the enum. It allows for:
 * - Direct access to enum values (e.g., `Status.PENDING`)
 * - Lookup methods (e.g., `Status.fromValue('pending')`)
 * - Type checking (e.g., `Status.isEnumValue(someValue)`)
 * - Iteration (e.g., `Array.from(Status)`)
 * 
 * @example
 * ```typescript
 * // Create an enum
 * const Status = CreateSafeEnum({
 *   PENDING: { value: 'pending', index: 0 },
 *   APPROVED: { value: 'approved', index: 1 },
 *   REJECTED: { value: 'rejected', index: 2 }
 * } as const);
 * 
 * // Access enum values
 * const status = Status.PENDING;
 * 
 * // Use static methods
 * const pending = Status.fromValue('pending');
 * const isValid = Status.hasValue('pending');
 * 
 * // Iterate over values
 * for (const status of Status) {
 *   console.log(status.toString());
 * }
 * ```
 * 
 * @see {@link SafeEnum} - The type of individual enum values
 * @see {@link CreateSafeEnum} - Function to create type-safe enums
 */
export interface SafeEnumObject {
  /**
   * Index signature for enum values and static methods.
   * @internal
   */
  [key: string]: SafeEnum | ((...args: any[]) => any);
  
  // Factory methods
  /**
   * Returns the enum value matching the given value, or undefined if not found
   * @param value The value to search for
   * @returns The enum value, or undefined if not found
   */
  fromValue(value: string): SafeEnum | undefined;
  /**
   * Returns the enum value matching the given key, or undefined if not found
   * @param key The key to search for
   * @returns The enum value, or undefined if not found
   */
  fromKey(key: string): SafeEnum | undefined;
  /**
   * Returns the enum value matching the given index, or undefined if not found
   * @param index The index to search for
   * @returns The enum value, or undefined if not found
   */
  fromIndex(index: number): SafeEnum | undefined;
  
  // Iterator support - allows for...of iteration over enum values
  
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
   * const statusKeys = Status.getKeys(); // ['PENDING', 'APPROVED', 'REJECTED']
   */
  getKeys(): string[];
  
  /**
   * Returns an array of all enum values as strings
   * @example
   * const statusValues = Status.getValues(); // ['pending', 'approved', 'rejected']
   */
  getValues(): string[];
  
  /**
   * Returns an array of all enum indexes
   * @example
   * const statusIndexes = Status.getIndexes(); // [0, 1, 2]
   */
  getIndexes(): number[];
  
  /**
   * Returns an array of all enum entries as [key, value] pairs
   * @example
   * const statusEntries = Status.getEntries(); // [['PENDING', SafeEnum], ['APPROVED', SafeEnum], ['REJECTED', SafeEnum]]
   * @returns Array of [key, SafeEnum] tuples
   */
  getEntries(): [string, SafeEnum][];
  
  /**
   * Returns the key of the enum value or Throws if undefined
   * @example
   * const statusKey = Status.PENDING.getKey(); // 'PENDING'
   */
  getKey(): string;
  
  /**
   * Returns the value of the enum or Throws if undefined
   * @example
   * const statusValue = Status.PENDING.getValue(); // 'pending'
   */
  getValue(): string;
  
  /**
   * Returns the index of the enum or Throws if undefined
   * @example
   * const statusIndex = Status.PENDING.getIndex(); // 0
   */
  getIndex(): number;
  
  //#region Iterator
  [Symbol.iterator](): IterableIterator<SafeEnum>;
  //#endregion
}
