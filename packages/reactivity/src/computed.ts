import { isObject } from "@mini-vue/shared"
import { effect, track, trigger } from "./effect"

/**
 * 基于effect 其中的取值会触发依赖收集
 * 第一次注册computed默认不执行，使用了lazy选项，同时传入一个自定义的schedular
 * 每次获取computed会触发getter，获得fn执行返回的结果
 * 每次依赖更新时，触发trigger，执行schedular
*/

class ComputedRefImpl {
  public effect
  public _value
  public _dirty = true
  constructor(public getter, public setter) {
    // 依赖更新时，触发schedular 重置_dirty以重新计算结果
    this.effect = effect(getter, { lazy: true, schedular: effect => {
      if (!this._dirty) {
        this._dirty = true
        // 触发依赖
        trigger(this, 'get', 'value')
      }
    } })
  }

  // 当取值的时候 执行effect返回结果
  // _dirty防止重复计算
  get value() {
    if (this._dirty) {
      this._value = this.effect()
      this._dirty = false
    }
    // 计算属性取值时 收集依赖
    track(this, 'get', 'value')
    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}

export function computed(getterOrOptions) {
  let getter
  let setter

  if (isObject(getterOrOptions)) {
    // 对象 存储get set
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  } else {
    // 函数 赋值给getter 并且设置只读
    getter = getterOrOptions
    setter = () => {
      console.warn('Write operation failed: computed value is readonly')
    }
  }

  return new ComputedRefImpl(getter, setter)
}