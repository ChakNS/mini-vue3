// 处理class
const patchClass = (el, next) => {
  next = next || ''
  el.className = next
}

// 处理style
const patchStyle = (el, prev, next) => {
  if (!next) {
    el.removeAttribute('style')
  } else {
    if (prev) {
      for (const key in prev) {
        if (!next[key]) {
          el.style[key] = ''
        }
      }
    }

    for (const key in next) {
      el.style[key] = next[key]
    }
  }
}

// 绑定事件 将事件挂在invoker的value，改变事件时，只更改value的值
// 避免重复挂载和卸载事件 提升性能
function createInvoker(fn) {
  const invoker = e => { invoker.value(e) }
  invoker.value = fn

  return invoker
}

// 处理事件
const patchEvents = (el, rawName, nextValue) => {
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[rawName]
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue // 替换事件
  } else {
    const eventName = rawName.toLowerCase().slice(2)
    if (nextValue) {
      const invoker = (invokers[rawName] = createInvoker(nextValue))
      el.addEventListener(eventName, invoker)
    } else if (existingInvoker) {
      el.removeEventListener(eventName, existingInvoker)
      invokers[rawName] = undefined
    }
  }
}

// 处理属性
const patchAttrs = (el, key, next) => {
  if (!next) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, next)
  }
}

export const patchProp = (el, key, prev, next) => {
  switch (key) {
    case 'class': // .className
      patchClass(el, next)
      break
    case 'style': // .style.xxx
      patchStyle(el, prev, next)
      break
    default:
      if (/^on[^a-z]/) {
        // event addEventListener
        patchEvents(el, key, next)
      } else {
        // 其他 setAttribute
        patchAttrs(el, key, next)
      }
  }
}