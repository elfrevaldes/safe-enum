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
 * // Simple usage with type export
 * const Status = CreateSafeEnum({
 *   PENDING: { value: 'pending', index: 0 },
 *   APPROVED: { value: 'approved', index: 1 },
 *   REJECTED: { value: 'rejected', index: 2 }
 * } as const);
 * 
 * // Usage:
 * const status: ReturnType<typeof Status.fromValue> = Status.fromKey('PENDING');
 * console.log(status.value); // 'pending'
 * 
 * // Advanced usage with explicit type export
 * export const RequestType = CreateSafeEnum({
 *   POST: { value: 'POST', index: 0 },
 *   GET: { value: 'GET', index: 1 },
 *   // ...
 * } as const);
 * // This will work with the updated types
 * export type RequestType = ReturnType<typeof RequestType.fromValue>;
 * 
 * // Usage:
 * const method: RequestType = RequestType.fromKey('POST');
 * console.log(method.value); // 'POST'
 * ```
 */
/**
 * Represents a type-safe enum value with lookup methods
 */
export interface SafeEnum {
  /** The string key of the enum value (e.g., 'PENDING') */
  readonly key: string;
  
  /** The string value of the enum (e.g., 'pending') */
  readonly value: string;
  
  /** The numeric index of the enum */
  readonly index: number;
  
  // Lookup methods
  fromIndex(num: number): SafeEnum | undefined;
  fromValue(str: string): SafeEnum | undefined;
  fromKey(key: string): SafeEnum | undefined;
  
  // Type guards
  hasValue(value: string): boolean;
  hasKey(key: string): boolean;
  hasIndex(index: number): boolean;
  isEnumValue(value: unknown): value is SafeEnum;
  
  // Comparison
  isEqual(other: SafeEnum | SafeEnum[]): boolean;
  
  // String representation
  toString(): string;
  toJSON(): { key: string; value: string; index: number };
  
  // Collection methods
  keys(): string[];
  values(): string[];
  indexes(): number[];
  entries(): [string, SafeEnum][];
  getEntries(): SafeEnum[];
  Key(): string;
  Value(): string;
  Index(): number;
  
  // Iterator
  [Symbol.iterator](): IterableIterator<SafeEnum>;
}
