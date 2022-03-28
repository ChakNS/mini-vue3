# 源码 reactivity的实现思路

## reactive

- **接受一个target**
- **如果target已经被只读包裹，直接返回**  `reactive(readonly(obj))`
- **开始创建响应式代理对象，同时四种类型的代理分别用WeakMap来缓存已经代理过的对象**
  - shallow
  - readonly
  - 数组和对象的代理
  - map和set集合的代理
- **查看是否为响应式对象 RAW，注意这里接受`readonly(reactive(obj))`的形式**
- **查看缓存，如有则返回**
- **检测对象类型，是数组、对象、集合均可以被代理，其他不能被代理（__v_skip标识、不可扩展）则返回源对象，如Object.freeze包装过的**
  - 源码中提供了toRaw、markRaw对目标打上__v_raw（将代理对象转化为原值）、__v_skip（不能被代理）的属性
- **使用proxy进行代理，区分对象和集合，使用不同的handler**
- **创建getter**
  - 拦截includes、indexOf、lastIndexOf重写原有方法，对每个索引收集依赖
  - 拦截push、pop、shift、unshift、splice重写原有方法，在执行的时候暂停依赖收集(toRaw)
    - 因为这些方法在调用时，length属性也会被访问，可能会造成内存泄漏
  - 过滤内置的symbol、原型链的访问，不做依赖收集
  - 对剩余的情况，除了只读的，均做依赖收集
  - 如果不是shallow且值为对象，则采用懒递归收集依赖
  - **如果reactive中包含ref，如果是数组且key是数值，则跳过，否则自动拆包(返回res.value)**
- **创建setter**
  - 把新值旧值都还原成原值
  - 如果老值是ref而新值不是，则将新值赋给老值的value上，保留ref
  - 判断是新增还是修改，数组通过索引与length的关系来判断
  - 针对原型链是proxy的情况，给对象赋值的同时会操作原型对象，因此通过判断receiver是否与target相同，来避免多次触发更新
- **代理过的对象会打上标识**

### effect
- 源码中对effect进行了重写，用类实现，并且做了相应的优化，比如嵌套effect、依赖清除、依赖作用域等