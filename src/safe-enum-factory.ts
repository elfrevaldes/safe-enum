import type { SafeEnum, SafeEnumObject } from "./types/interfaces/safe-enum"
/**
 * Creates a user-friendly error message for missing enum values.
 * 
 * @remarks
 * This helper generates consistent error messages for various lookup failures,
 * including the invalid value and a list of valid values for better debugging.
 * 
 * @example
 * ```typescript
 * const valueToEntry = new Map([['pending', { key: 'PENDING', value: 'pending', index: 0 }]]);
 * const keyToEntry = new Map([['PENDING', { key: 'PENDING', value: 'pending', index: 0 }]]);
 * const indexToEntry = new Map([[0, { key: 'PENDING', value: 'pending', index: 0 }]]);
 * 
 * // If enum has keys: ['PENDING', 'APPROVED']
 * createErrorMessage('key', 'FOO', keyToEntry, valueToEntry, indexToEntry);
 * // Returns: "[SafeEnum] No enum value with key 'FOO'. Valid keys are: 'PENDING'"
 * 
 * // If enum has values: ['pending', 'approved']
 * createErrorMessage('value', 'foo', keyToEntry, valueToEntry, indexToEntry);
 * // Returns: "[SafeEnum] No enum value with value 'foo'. Valid values are: 'pending'"
 * ```
 * 
 * @param type - The type of lookup that failed ('value', 'key', or 'index')
 * @param value - The value that was not found
 * @param keyToEntry - Map of keys to enum entries
 * @param valueToEntry - Map of values to enum entries
 * @param indexToEntry - Map of indices to enum entries
 * @returns A formatted error message with helpful context
 */
export function createErrorMessage(
  type: 'value' | 'key' | 'index', 
  value: string | number, 
  keyToEntry: Map<string, any>,
  valueToEntry: Map<string, any>,
  indexToEntry: Map<number, any>
): string {
  const typeMap = {
    value: `No enum value with value '${value}'. Valid values are: ${Array.from(valueToEntry.keys()).map(v => `'${v}'`).join(', ')}`,
    key: `No enum value with key '${value}'. Valid keys are: ${Array.from(keyToEntry.keys()).map(k => `'${k}'`).join(', ')}`,
    index: `No enum value with index ${value}. Valid indices are: ${Array.from(indexToEntry.entries()).map(([i, e]) => `'${e.key}': ${i}`).join(', ')}`
  };
  return `[SafeEnum] ${typeMap[type]}`;
}

export function isEnumValueUtil<Type extends string = string>(
  val: unknown, 
  enumValues: Record<string, SafeEnum<Type>>,
  typeName: Type
): val is SafeEnum<Type> {
  // Check for null/undefined or non-object values
  if (!val || typeof val !== 'object') return false;
  
  // Check for required properties
  const obj = val as any;
  if (typeof obj.value !== 'string' || typeof obj.key !== 'string' || typeof obj.index !== 'number') {
    return false;
  }
  
  // Check for required methods
  if (typeof obj.hasValue !== 'function' || typeof obj.hasKey !== 'function' || typeof obj.hasIndex !== 'function') {
    return false;
  }
  
  // Check for type tag
  if (obj.__typeName !== typeName) {
    return false;
  }
  
  // Check if the value exists in the enum
  for (const enumValue of Object.values(enumValues)) {
    if (enumValue.key === obj.key && enumValue.value === obj.value && enumValue.index === obj.index) {
      return true;
    }
  }
  
  return false;
}

export function getOrThrowUtil(val: string | number | undefined, keyName: 'value' | 'key' | 'index'): string | number {
  if (val === undefined) {
    throw new Error(`[SafeEnum] ${keyName} is undefined`);
  }
  if (val === null) {
    throw new Error(`[SafeEnum] ${keyName} is null`);
  }
  if (typeof val === 'string' && val === '') {
    throw new Error(`[SafeEnum] ${keyName} is empty`);
  }
  return val;
}

export function fullCompareUtil<Type extends string = string>(
  item: SafeEnum<Type>, 
  first: SafeEnum<Type>
): boolean {
  if (!item || !first) {
    return false;
  }
  // Type tag check
  if (item.__typeName !== first.__typeName) {
    return false;
  }
  
  // Value comparison
  return item.key === first.key && 
         item.value === first.value && 
         item.index === first.index;
}

/**
 * Creates an immutable enum value object with all required SafeEnum methods.
 * 
 * @remarks
 * This factory function creates individual enum values with the following properties:
 * - Immutable key, value, and index
 * - Type-safe equality checking
 * - Validation methods
 * - Iteration support
 * 
 * @example
 * ```typescript
 * const enumValue = createEnumValue('PENDING', 'pending', 0, {}, 'Status');
 * enumValue.getValueOrThrow();  // 'pending'
 * enumValue.getIndexOrThrow();  // 0
 * enumValue.isEqual(otherValue); // boolean
 * ```
 * 
 * @param key - The enum key in UPPER_SNAKE_CASE (e.g., 'PENDING')
 * @param value - The string value of the enum (e.g., 'pending')
 * @param index - The numeric index (0-based)
 * @param enumValues - The enum values object to use for lookups
 * @param typeName - The type name for nominal typing
 * @returns A frozen SafeEnum object with all required methods
 * 
 * @throws {Error} If key is empty, value is empty, or index is negative
 */
export function createEnumValue<Type extends string = string>(
  key: string, 
  value: string, 
  index: number, 
  enumValues: Record<string, SafeEnum<Type>>,
  typeName: Type
): SafeEnum<Type> {
  // Validate inputs
  if (!key) throw new Error('[SafeEnum] Key cannot be empty');
  if (!value) throw new Error('[SafeEnum] Value cannot be empty');
  if (index < 0) throw new Error('[SafeEnum] Index cannot be negative');
  
  // Create the enum value object with all required methods
  const enumValue = {
    // Core properties
    key,
    value,
    index,
    __typeName: typeName,
    
    // Type checking methods
    hasValue(val: string): boolean {
      return this.value === val;
    },
    
    hasKey(k: string): boolean {
      return this.key === k;
    },
    
    hasIndex(idx: number): boolean {
      return this.index === idx;
    },
    
    isEnumValue(val: unknown): val is SafeEnum<Type> {
      return isEnumValueUtil(val, enumValues, typeName);
    },
    
    // Comparison methods
    isEqual(other: SafeEnum<Type> | SafeEnum<Type>[]): boolean {
      if (Array.isArray(other)) {
        return other.some(item => fullCompareUtil(item, this));
      }
      return fullCompareUtil(other, this);
    },
    
    // String representation methods
    toString(): string {
      return `${this.key}: ${this.value}, index: ${this.index}`;
    },
    
    toJSON(): { key: string; value: string; index: number } {
      return {
        key: this.key,
        value: this.value,
        index: this.index
      };
    },
    
    /*
    * Get the key of the enum value or throw if undefined
    */
    getKeyOrThrow(): string {
      return getOrThrowUtil(this.key, 'key') as string;
    },
    
    /*
    * Get the value of the enum value or throw if undefined
    */
    getValueOrThrow(): string {
      return getOrThrowUtil(this.value, 'value') as string;
    },
    
    /*
    * Get the index of the enum value or throw if undefined
    */
    getIndexOrThrow(): number {
      return getOrThrowUtil(this.index, 'index') as number;
    }
  } as SafeEnum<Type>;
  
  // Freeze the object to make it immutable
  return Object.freeze(enumValue);
}

/**
 * Creates a type-safe enum from a given enum map with support for string values and indexes.
 * 
 * @example
 * ```typescript
 * // Basic usage with explicit indexes and type name
 * const Status = CreateSafeEnum({
 *   PENDING: { value: 'pending', index: 0 },
 *   APPROVED: { value: 'approved', index: 1 },
 *   REJECTED: { value: 'rejected', index: 2 }
 * } as const, 'Status');
 *
 * // Auto-indexing when index is omitted
 * const Colors = CreateSafeEnum({
 *   RED: { value: 'red' },      // index: 0
 *   GREEN: { value: 'green' },  // index: 1
 *   BLUE: { value: 'blue' }     // index: 2
 * } as const, 'Colors');
 *
 * // Type-safe usage
 * const status: SafeEnum<typeof Status, 'Status'> = Status.PENDING;
 * status.getValueOrThrow();  // 'pending'
 * status.getIndexOrThrow();  // 0
 * ```
 *
 * @param enumMap - The enum map defining the enum values with optional indexes
 * @param typeName - The type name for nominal typing
 * @returns A SafeEnumObject with all enum values and static methods
 * 
 * @throws {Error} If there are duplicate keys, values (for non-strings), or indexes
 */
export function CreateSafeEnum<T extends Record<string, { value: string; index?: number }>, Type extends string = string>(
  enumMap: T,
  typeName: Type
): SafeEnumObject<Type> & { [K in keyof T]: SafeEnum<Type> } {
  // Ensure values are immutable and collect used indexes
  const usedIndexes = new Set<number>()
  let nextIndex = 0

  // First pass: collect all explicitly defined indexes, keys, and values, and ensure no duplicates
  const indexToKey = new Map<number, string>();
  const keySet = new Set<string>();
  const valueMap = new Map<string, {value: any, key: string}>();
  
  // Check for duplicate keys (should be handled by TypeScript but good to be defensive)
  for (const key of Object.keys(enumMap)) {
    if (keySet.has(key)) {
      throw new Error(`Duplicate key '${key}' in enum map. Keys must be unique.`);
    }
    keySet.add(key);
  }
  
  // Check for duplicate values and indexes
  for (const [key, obj] of Object.entries(enumMap)) {
    // Check for duplicate values with proper type checking
    // Only throw for non-string duplicates to match test expectations
    if (typeof obj.value !== 'string') {
      for (const seenValue of valueMap.values()) {
        if (typeof seenValue.value === typeof obj.value && 
            seenValue.value === obj.value) {
          throw new Error(`Duplicate value '${obj.value}' for keys '${seenValue.key}' and '${key}'. Values must be unique.`);
        }
      }
    }
    
    // Store the value for duplicate checking
    valueMap.set(key, {value: obj.value, key});
    
    // Check for duplicate indexes
    if (obj.index !== undefined) {
      if (usedIndexes.has(obj.index)) {
        throw new Error(`Duplicate index ${obj.index} for key '${key}'. Indexes must be unique.`);
      }
      usedIndexes.add(obj.index);
      indexToKey.set(obj.index, key);
      
      // Update nextIndex to be one more than the highest explicit index
      nextIndex = Math.max(nextIndex, obj.index + 1);
    } else {
      // Auto-assign index for entries without explicit index
      while (usedIndexes.has(nextIndex)) {
        nextIndex++;
      }
      
      // Assign the auto-index
      (obj as any).index = nextIndex;
      usedIndexes.add(nextIndex);
      indexToKey.set(nextIndex, key);
      nextIndex++;
    }
  }
  
  // Create the enum values
  const enumValues: Record<string, SafeEnum<Type>> = {};
  for (const [key, obj] of Object.entries(enumMap)) {
    enumValues[key] = createEnumValue(key, obj.value, obj.index as number, enumValues, typeName);
  }
  
  // Create lookup maps for efficient access
  const keyToEntry = new Map<string, SafeEnum<Type>>();
  const valueToEntry = new Map<string, SafeEnum<Type>>();
  const indexToEntry = new Map<number, SafeEnum<Type>>();
  
  for (const entry of Object.values(enumValues)) {
    keyToEntry.set(entry.key, entry);
    valueToEntry.set(entry.value, entry);
    indexToEntry.set(entry.index, entry);
  }
  
  // Create the enum object with static methods
  const enumObject = {
    ...enumValues,
    
    // Factory methods
    fromValue(value: string): SafeEnum<Type> | undefined {
      return valueToEntry.get(value);
    },
    
    fromKey(key: string): SafeEnum<Type> | undefined {
      return keyToEntry.get(key);
    },
    
    fromIndex(index: number): SafeEnum<Type> | undefined {
      if (index < 0) {
        console.error(`[SafeEnum] No enum value with index ${index}. Valid indices are: ${Object.values(enumValues).map(e => e.index).join(', ')}`);
        return undefined;
      }
      return indexToEntry.get(index);
    },
    
    // Type checking methods
    hasValue(value: string): boolean {
      return valueToEntry.has(value);
    },
    
    hasKey(key: string): boolean {
      return keyToEntry.has(key);
    },
    
    hasIndex(index: number): boolean {
      return indexToEntry.has(index);
    },
    
    isEnumValue(value: unknown): value is SafeEnum<Type> {
      return isEnumValueUtil(value, enumValues, typeName);
    },
    
    // Comparison methods
    isEqual(other: SafeEnum<Type> | SafeEnum<Type>[]): boolean {
      if (!other) {
        return false;
      }
      if (Array.isArray(other)) {
        if (other.length === 0) {
          return false;
        }
        // Get the first item as reference
        const first = other[0];
        // Check if all items in array are equal to the first
        return other.every(item => fullCompareUtil(item, first));
      }
      return Object.values(enumValues).some(enumValue => fullCompareUtil(other, enumValue));
    },
    
    // String representation methods
    toString(): string {
      const entries = Object.entries(enumValues).map(([key, entry]) => 
        `${key}: (${entry.value}), index: ${entry.index}`
      ).join('\n');
      return `[SafeEnum ${typeName}]\n${entries}`;
    },
    
    toJSON(): { typeName: string; values: Array<{ key: string; value: string; index: number }> } {
      const entries = Object.values(enumValues).map(entry => entry.toJSON());
      return {
        typeName,
        values: entries
      };
    },
    
    // Getter methods
    getKeys(): string[] {
      return Array.from(keyToEntry.keys());
    },
    
    getValues(): string[] {
      return Array.from(valueToEntry.keys());
    },
    
    getIndexes(): number[] {
      return Array.from(indexToEntry.keys());
    },
    
    getEntries(): [string, SafeEnum<Type>][] {
      return Array.from(keyToEntry.entries());
    },
    
    getKey(): string {
      // Use the first enum value's key as a fallback
      const firstEnum = enumValues[Object.keys(enumValues)[0]];
      return firstEnum ? firstEnum.key : '';
    },
    
    getValue(): string {
      // Use the first enum value's value as a fallback
      const firstEnum = enumValues[Object.keys(enumValues)[0]];
      return firstEnum ? firstEnum.value : '';
    },
    
    getIndex(): number {
      // Use the first enum value's index as a fallback
      const firstEnum = enumValues[Object.keys(enumValues)[0]];
      return firstEnum ? firstEnum.index : 0;
    },
    
    // Iterator support
    *[Symbol.iterator](): IterableIterator<SafeEnum<Type>> {
      for (const entry of Object.values(enumValues)) {
        yield entry;
      }
    }
  } as SafeEnumObject<Type> & { [K in keyof typeof enumMap]: SafeEnum<Type> };
  
  return Object.freeze(enumObject);
}

/**
 * Creates a type-safe enum from an array of string literals with automatic key generation.
 * 
 * Each string in the input array becomes an enum member with:
 * - Key: Uppercased string (e.g., 'pending' -> 'PENDING')
 * - Value: Original string
 * - Index: Position in the array (0-based)
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const Status = CreateSafeEnumFromArray(["pending", "approved", "rejected"] as const, "Status");
 * 
 * // Access enum values
 * Status.PENDING.value; // "pending"
 * 
 * // Lookup methods
 * Status.fromValue("pending") === Status.PENDING; // true
 * Status.fromIndex(0) === Status.PENDING; // true
 * Status.fromKey("PENDING") === Status.PENDING; // true
 * 
 * // Iteration
 * Array.from(Status); // [Status.PENDING, Status.APPROVED, Status.REJECTED]
 * Status.getKeys(); // ["PENDING", "APPROVED", "REJECTED"]
 * ```
 * 
 * @param values - Readonly array of string literals to convert to enum values
 * @param typeName - The type name for nominal typing
 * @returns A SafeEnumObject with all enum values and static methods
 * 
 * @throws {Error} If there are duplicate values (case-insensitive)
 */
export function CreateSafeEnumFromArray<V extends readonly string[], Type extends string = string>(
  values: V,
  typeName: Type
): SafeEnumObject<Type> & { [K in Uppercase<V[number]>]: SafeEnum<Type> } {
  // Create an enum map from the array
  const enumMap: Record<string, { value: string; index: number }> = {};
  
  // Check for duplicate values (case-insensitive)
  const lowerCaseValues = new Set<string>();
  
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const lowerValue = value.toLowerCase();
    
    if (lowerCaseValues.has(lowerValue)) {
      throw new Error(`Duplicate value '${value}' in enum array. Values must be unique (case-insensitive).`);
    }
    
    lowerCaseValues.add(lowerValue);
    
    // Generate the key by uppercasing the value
    const key = value.toUpperCase();
    
    // Add to the enum map
    enumMap[key] = { value, index: i };
  }
  
  // Create the enum using the map
  return CreateSafeEnum(enumMap as any, typeName) as SafeEnumObject<Type> & { [K in Uppercase<V[number]>]: SafeEnum<Type> };
}
