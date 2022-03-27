import { isObject } from '@mini-vue/shared'
import { mutableHandlers, shallowReactiveHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'

// 响应式
export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}

// 浅响应式
export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

// 只读
export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)
}

// 浅只读
export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}

// 缓存代理对象
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
/**
 * @param target 目标对象
 * @param isReadonly 是否只读
 * @param baseHandler 创建代理对象
*/
function createReactiveObject(target, isReadonly, baseHandler) {
  if (!isObject(target)) return target

  const proxyMap = isReadonly ? readonlyMap : reactiveMap

  if (proxyMap.has(target)) return proxyMap.get(target)
  const proxy = new Proxy(target, baseHandler)
  proxyMap.set(target, proxy)
  return proxy
}