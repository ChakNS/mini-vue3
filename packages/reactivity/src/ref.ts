/**
 * 把普通类型变成一个引用类型，使其具备响应式的能力
 * 也可以接收对象 通过reactive包装
*/

import { hasChanged, isArray, isObject } from "@mini-vue/shared"
import { reactive } from "./reactive"
import { track, trigger } from './effect'

export function ref(value) {
  return createRef(value)
}

export function shallowRef(value) {
  return createRef(value, true)
}

const convert = v => isObject(v) ? reactive(v) : v

const isRef = r => !!(r && r.__v_isRef === true)
class RefImpl {
  public _value
  public __v_isRef = true
  constructor(public rawValue, public shallow) {
    this._value = shallow ? rawValue : convert(rawValue)
  }

  get value() {
    // 收集依赖
    track(this, 'get', 'value')
    return this._value
  }

  set value(newValue) {
    //  触发依赖
    if (hasChanged(newValue, this.rawValue)) {
      this.rawValue = newValue // 用于下次比对
      this._value = this.shallow ? newValue : convert(newValue)
      trigger(this, 'set', 'value', newValue)
    }
  }
}

function createRef(value, shallow = false) {
  // 借助类的属性访问器
  return new RefImpl(value, shallow)
}

class ObjectRefImpl {
  public __v_isRef = true
  constructor (public target, public key) {}

  get value() {
    return this.target[this.key]
  }

  set value(newValue) {
    this.target[this.key] = newValue
  }
}

// 代理响应式对象的某个属性，使其具备响应式能力
// 实际上只是做了依次类似转发的功能
// 使对某个属性的访问 变成使访问原响应式对象的属性，从而具备响应式能力
export function toRef(target, key) {
  console.log(isRef(target[key]))
  if (isRef(target[key])) return target[key]
  return new ObjectRefImpl(target, key)
}

// 对target所有属性都做toRef
export function toRefs(target) {
  const res = isArray(target) ? new Array(target.length) : {}
  for (const key in target) {
    res[key] = toRef(target, key)
  }

  return res
}
