export function isObject<T>(value: T): value is T & Record<string, any> {
  return typeof value === 'object' && value !== null
}
