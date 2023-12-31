/* eslint-disable @typescript-eslint/no-explicit-any */
export function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item))
}
export function mergeDeep<T extends Record<string, any>>(
  target: T, ...sources: Array<Partial<T>>
) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source || {})) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key]!)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}
export const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase()
  })
}