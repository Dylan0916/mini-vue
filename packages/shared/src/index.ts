export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null
}

export function isFunction(value: unknown): value is () => any {
  return typeof value === 'function'
}

export function hasChanged<T>(newValue: T, oldValue: T) {
  return !Object.is(newValue, oldValue)
}
