/**
 * 把普通类型变成一个引用类型，使其具备响应式的能力
 * 也可以接收对象 通过reactive包装
*/

import { hasChanged, isObject } from "@mini-vue/shared"
import { reactive } from "./reactive"
import { track, trigger } from './effect'

export function ref(value) {
  return createRef(value)
}

export function shallowRef(value) {
  return createRef(value, true)
}

const convert = v => isObject(v) ? reactive(v) : v
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
