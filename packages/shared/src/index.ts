export function isObject(val) {
  return typeof val === 'object' && val !== null
}

export const isArray = Array.isArray

export const extend = Object.assign

export function isIntegerKey(key) {
  return parseInt(key) + '' === key
}

export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

export const hasChanged = (oldValue, newValue) => oldValue !== newValue