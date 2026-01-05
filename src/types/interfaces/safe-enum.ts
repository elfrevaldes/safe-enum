/**
 * Utility type to ensure literal type preservation for CreateSafeEnumFromArray
 */
export type LiteralArray<T extends readonly string[]> = T;

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
 * const httpMethods = CreateSafeEnum({
 *   GET: { value: 'GET', index: 0 },
 *   POST: { value: 'POST', index: 1 },
 *   PUT: { value: 'PUT', index: 2 }
 * } as const, "HttpMethods");
 * 
 * // Type is 'GET' | 'POST' | 'PUT'
 * type HttpMethodType = SafeEnum<"HttpMethods">;
 * 
 * // Usage in function parameters
 * function handleRequest(method: HttpMethodType) {
 *   // method is type-safe and can only be 'GET', 'POST', or 'PUT'
 * }
 * ```
 */
export type EnumType<T> = T extends { value: infer U } ? U : never;

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
 * - `__typeName`: The string literal type name for nominal typing (e.g., 'HttpProtocol')
 * 
 * @template Type - String literal type name for nominal typing
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * // Create an enum
 * const httpProtocol = CreateSafeEnum({
 *   GET: { value: 'GET', index: 0 },
 *   POST: { value: 'POST', index: 1 },
 *   PUT: { value: 'PUT', index: 2 }
 * } as const, "HttpProtocol");
 * 
 * // Type-safe usage
 * const protocol: SafeEnum<'HttpProtocol'> = httpProtocol.GET;
 * console.log(protocol.value);  // 'GET'
 * console.log(protocol.index);  // 0
 * console.log(protocol.__typeName);  // 'HttpProtocol'
 * ```
 * 
 * @example
 * ### Creating with CreateSafeEnumFromArray
 * ```typescript
 * // Type safety prevents mixing different enum types
 * const httpProtocol = CreateSafeEnumFromArray(['GET', 'POST', 'PUT'], "HttpProtocol");
 * 
 * // These type aliases provide nominal typing
 * type HttpProtocolType = SafeEnum<'HttpProtocol'>;
 * 
 * ```
 * @example
 * // This works fine
 * const protocol: HttpProtocolType = httpProtocol.GET;
 * 
 * // This would be a type error
 * // const badProtocol: HttpProtocolType = httpProtocol.ADMIN; // Error!
 * // This works
 * fetchData(httpProtocol.GET, 'https://api.example.com');
 * 
 * @see {@link CreateSafeEnum} - Function to create type-safe enums
 * @see {@link CreateSafeEnumFromArray} - Alternative factory for array-based enum creation
 */
/**
 * Interface for enum value instances with strong nominal typing
 * @template Type - String literal type name for nominal typing
 */
export interface SafeEnum<Type extends string> extends SafeEnumBase {
  /** 
   * @internal Brand property for nominal typing 
   * This property doesn't exist at runtime but helps TypeScript distinguish between different enum types
   */
  readonly __type?: Type;
  
  /**
   * Type tag for nominal typing
   * @remarks
   * This property exists at runtime and helps TypeScript distinguish between different enum types.
   * It contains the string literal type name passed to CreateSafeEnum and is used for both compile-time
   * and runtime type checking to prevent mixing values from different enum types.
   */
  readonly __typeName: Type;
  
  /** The string key of the enum value (e.g., 'PENDING') */
  readonly key: string;
  
  /** The string value of the enum (e.g., 'pending') */
  readonly value: string;
  
  /** The numeric index of the enum */
  readonly index: number;
  
  //#region Type checking
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
   * @returns true if the value is an enum Object, false otherwise
   */
  isEnumValue(value: unknown): value is SafeEnum<Type>;
  //#endregion
  
  //#region Comparison
  /**
   * Checks if the given enum value or array of values matches this enum value
   * @param other The value or array of values to compare with
   * @returns true if the values match, false otherwise
   */
  isEqual(other: SafeEnum<Type> | SafeEnum<Type>[]): boolean;
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
 * - Direct access to enum values (e.g., `HttpProtocol.GET`)
 * - Lookup methods (e.g., `HttpProtocol.fromValue('GET')`)
 * - Type checking (e.g., `HttpProtocol.isEnumValue(someValue)`) 
 * - Type-safe comparison (e.g., `HttpProtocol.isEqual(value)`)
 * - Iteration (e.g., `Array.from(HttpProtocol)`)
 * 
 * Each enum object is tagged with a type name that provides nominal typing at both compile time
 * and runtime, preventing accidental mixing of different enum types.
 * 
 * @template Type - String literal type name for nominal typing
 * 
 * @example
 * ```typescript
 * // Create an enum
 * const httpProtocol = CreateSafeEnum({
 *   GET: { value: 'GET', index: 0 },
 *   POST: { value: 'POST', index: 1 },
 *   PUT: { value: 'PUT', index: 2 }
 * } as const, "HttpProtocol");
 * 
 * // Access enum values
 * const protocol = httpProtocol.GET;
 * console.log(protocol.__typeName); // 'HttpProtocol'
 * 
 * // Use static methods
 * const getMethod = httpProtocol.fromValue('GET');
 * const isValid = httpProtocol.hasValue('GET');
 * 
 * // Type-safe comparison
 * const someValue: SafeEnum<'HttpProtocol'> = httpProtocol.GET;
 * if (httpProtocol.GET.isEqual(someValue)) {
 *   // someValue is definitely a value from HttpProtocol
 * }
 * 
 * // Iterate over values
 * for (const method of httpProtocol) {
 *   console.log(method.toString());
 * }
 * ```
 * 
 * @see {@link SafeEnum} - The type of individual enum values
 * @see {@link CreateSafeEnum} - Function to create type-safe enums
 */
export interface SafeEnumObject<Type extends string> {
  
  // Factory methods
  /**
   * Returns the enum value matching the given value, or undefined if not found
   * @param value The value to search for
   * @returns The enum value, or undefined if not found
   */
  fromValue(value: string): SafeEnum<Type> | undefined;

  /**
   * Returns the enum value matching the given key, or undefined if not found
   * @param key The key to search for
   * @returns The enum value, or undefined if not found
   */
  fromKey(key: string): SafeEnum<Type> | undefined;

  /**
   * Returns the enum value matching the given index, or undefined if not found
   * @param index The index to search for
   * @returns The enum value, or undefined if not found
   */
  fromIndex(index: number): SafeEnum<Type> | undefined;

  //#region Type checking
  /**
   * Checks if the enum has a value with the given value
   * @param value The value to check
   * @returns true if the enum has a value with the given value, false otherwise
   */
  hasValue(value: string): boolean;

  /**
   * Checks if the enum has a value with the given key
   * @param key The key to check
   * @returns true if the enum has a value with the given key, false otherwise
   */
  hasKey(key: string): boolean;

  /**
   * Checks if the enum has a value with the given index
   * @param index The index to check
   * @returns true if the enum has a value with the given index, false otherwise
   */
  hasIndex(index: number): boolean;

  /**
   * Type guard to check if the given value is an enum value
   * @param value The value to check
   * @returns true if the value is an enum Object, false otherwise
   */
  isEnumValue(value: unknown): value is SafeEnum<Type>;
  //#endregion
  
  //#region Comparison
  /**
   * Checks if the given enum value or array of values matches any enum value in this enum
   * @param other The value or array of values to compare with
   * @returns true if any values match, false otherwise
   */
  isEqual(other: SafeEnum<Type> | SafeEnum<Type>[]): boolean;
  //#endregion
  
  //#region String representation
  /**
   * Returns a string representation of the enum value
   * @returns "key: value, index: index"
   */
  toString(): string;
  
  /**
   * Returns a JSON representation of the enum object
   * @returns A JSON representation containing the type name and all enum values
   * @example
   * ```typescript
   * {
   *   typeName: 'HttpProtocol',
   *   values: [
   *     { key: 'GET', value: 'GET', index: 0 },
   *     { key: 'POST', value: 'POST', index: 1 },
   *     // ... other values
   *   ]
   * }
   * ```
   */
  toJSON(): { typeName: string; values: Array<{ key: string; value: string; index: number }> };
  //#endregion
  
  //#region Getters
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
   * @returns Array of [key, value] pairs
   */
  getEntries(): [string, SafeEnum<Type>][];
  
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

  /**
   * Returns the key of the enum value (throws if not found)
   * @example
   * const statusKey = Status.PENDING.getKeyOrThrow(); // 'PENDING'
   * @throws {Error} If the enum value is not found
   */
  getKeyOrThrow(): string;

  /**
   * Returns the value of the enum (throws if not found)
   * @example
   * const statusValue = Status.PENDING.getValueOrThrow(); // 'pending'
   * @throws {Error} If the enum value is not found
   */
  getValueOrThrow(): string;

  /**
   * Returns the index of the enum (throws if not found)
   * @example
   * const statusIndex = Status.PENDING.getIndexOrThrow(); // 0
   * @throws {Error} If the enum value is not found
   */
  getIndexOrThrow(): number;
  //#endregion

  // Iterator support - allows for...of iteration over enum values
  /**
   * Symbol.iterator implementation for iterating over enum values
   * @returns An iterator for the enum values
   * @example
   * ```typescript
   * // Iterate over enum values
   * for (const status of Status) {
   *   console.log(status.toString());
   * }
   * ```
   */
  [Symbol.iterator](): IterableIterator<SafeEnum<Type>>;
}

