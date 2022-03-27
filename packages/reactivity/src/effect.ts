/**
 * 数组需要访问到里面的索引触发getter，才会收集到依赖
 * 如JSON.stringify(proxy.arr) 会访问到每一个key，收集到对应的依赖
 * 而在实际使用中，当数组渲染到html时必然会被stringify，因此不会出现更新不到的问题
*/

import { isArray, isIntegerKey } from "@mini-vue/shared"

export function effect(fn, options:any = {}) {
  const effect = createReactiveEffect(fn, options)

  if (!options.lazy) {
    effect()
  }

  return effect
}

// effect 调用栈 跟函数调用栈类似 解决嵌套effect
const effectStack = []
let activeEffect
let id = 0
function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    try {
      effectStack.push(effect)
      activeEffect = effect
      return fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }

  effect.id = id++
  effect.__isEffect = true
  effect.options = options
  effect.deps = [] // 收集依赖

  return effect
}

const targetMap = new WeakMap()

export function track(target, type, key) {
  // 非effect中取值，无需收集
  if (activeEffect === undefined) return

  /**
   * 收集完成的依赖大概是这样的结构
   * WeakMap {
   *   { version: '3.x' }: Map{
   *     version: Set[effect1, effect2]
   *   }
   * }
  */
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  if (!dep.has(activeEffect)) dep.add(activeEffect)
}

// 触发effect
// 这里需要对数组做两个特殊处理
export function trigger(target, type, key, newValue, oldValue?) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return

    const effectSet = new Set()

    // 1、如果数组收集了部分索引依赖，而修改了数组的length
    //    同时length的值比这个索引要小，则触发更新
    if (key === 'length' && isArray(target)) {
      depsMap.forEach((dep, key) => {
        if (key > newValue || key === 'length') {
          add(dep)
        }
      })
    } else {
      add(depsMap.get(key))
      // 2、数组的push操作，在创建新的索引之后，会将length + 1
      //    而此时length的新旧值相同，我们在setter过滤了，也就不会触发length的更新
      //    需要手动触发
      switch(type) {
        case 'add':
          isArray(target) && isIntegerKey(key) && add(depsMap.get('length'))
      }
    }

    // 用一个新的set存储effect再执行，避免重复
    function add(effs) {
      effs && effs.forEach(eff => effectSet.add(eff))
    }

    effectSet.forEach((effect: any) => effect())
}