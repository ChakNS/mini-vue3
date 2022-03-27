import { isObject, isArray, isIntegerKey, extend, hasOwn, hasChanged } from '@mini-vue/shared'
import { reactive, readonly } from './reactive'
import { track, trigger } from './effect'

/**
 * vue3 是劫持对象，而不是改写原对象，同时使用懒递归
 * vue2 是属性劫持，改写了原对象，并且在初始化时便递归
 * 
 * vue3 可以对不存在的属性进行获取，也会走get，并且支持数组
*/

// 创建getter
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    // 收集依赖
    if (!isReadonly) {
      track(target, 'get', key)
    }

    // 浅响应式 直接返回
    if (shallow) return res
    
    // 取值仍是对象 则懒递归 提升性能
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

// 创建setter
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const oldValue = target[key]
    const hasKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)

    const res = Reflect.set(target, key, value, receiver)
    if (!hasKey) {
      // 新增
      trigger(target, 'add', key, value)
    } else if (hasChanged(oldValue, value)) {
      // 修改
      trigger(target, 'set', key, value, oldValue)
    }

    return res
  }
}

// getter
const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

// setter
const set = createSetter(false)
const shallowSet = createSetter(true)

// 只读setter
const readonlySet = {
  set(target, key) {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target)
    return true
  }
}

// reactive
export const mutableHandlers = {
  get,
  set
}

// shallowReactive
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
}

// readonly
export const readonlyHandlers = extend({
  get: readonlyGet
}, readonlySet)

//shallowReadonly
export const shallowReadonlyHandlers = extend({
  get: shallowReadonlyGet
}, readonlySet)