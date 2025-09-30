export function isObject<T>(value: T): value is T & Record<string, any> {
  return typeof value === 'object' && value !== null
}

export function hasChanged<T>(newValue: T, oldValue: T) {
  return !Object.is(newValue, oldValue)
}
