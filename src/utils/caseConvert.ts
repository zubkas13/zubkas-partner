/**
 * Converts a camelCase string to snake_case.
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converts a snake_case string to camelCase.
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts all keys in an object from camelCase to snake_case.
 * Recursively handles nested objects and arrays.
 */
export function toSnakeRow<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = toSnakeCase(key);
    const val = obj[key];
    if (Array.isArray(val)) {
      result[snakeKey] = val.map(v => (v !== null && typeof v === 'object' && !Array.isArray(v)) ? toSnakeRow(v as Record<string, unknown>) : v);
    } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      result[snakeKey] = toSnakeRow(val as Record<string, unknown>);
    } else {
      result[snakeKey] = val;
    }
  }
  return result;
}

/**
 * Converts all keys in an object from snake_case to camelCase.
 * Recursively handles nested objects and arrays.
 */
export function toCamelRow<T = Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = toCamelCase(key);
    const val = obj[key];
    if (Array.isArray(val)) {
      result[camelKey] = val.map(v => (v !== null && typeof v === 'object' && !Array.isArray(v)) ? toCamelRow(v as Record<string, unknown>) : v);
    } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      result[camelKey] = toCamelRow(val as Record<string, unknown>);
    } else {
      result[camelKey] = val;
    }
  }
  return result as T;
}
