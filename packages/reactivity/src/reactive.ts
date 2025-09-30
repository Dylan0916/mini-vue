import { isObject, hasChanged } from '@vue/shared'

import { isRef } from './ref'
import { track, trigger } from './dep'
import { ReactiveTarget, ReactiveProxy } from './types'

const reactiveMap = new WeakMap<ReactiveTarget, ReactiveProxy>()
const reactiveSet = new Set<ReactiveProxy>()

const mutableHandlers: ProxyHandler<ReactiveTarget> = {
  get(target, key, receiver) {
    track(target, key)

    const res = Reflect.get<any, any>(target, key, receiver)

    if (isRef(res)) {
      return res.value
    }
    if (isObject(res)) {
      return reactive(res)
    }

    return res
  },
  set(target, key, newValue, receiver) {
    const oldValue = target[key as string]

    /**
     * const a = ref(0)
     * target = { a }
     * 更新 target.a = 1 時，他就等於更新了 a.value
     * a.value = 1
     */
    if (isRef(oldValue) && !isRef(newValue)) {
      oldValue.value = newValue

      // 改了 ref 的值，會通知 sub 更新，所以要 return 不然下方 trigger 又會觸發 trigger 更新 會觸發兩次
      return true
    }

    const res = Reflect.set(target, key, newValue, receiver)

    if (hasChanged(newValue, oldValue)) {
      trigger(target, key)
    }

    return res
  },
}

export function createReactiveObject<T>(target: T) {
  if (!isObject(target)) {
    return
  }

  /**
   * 如果這個 target 儲存在 reactiveSet 中
   * 表示 target 是一個響應式物件 (proxy)，直接返回已經建立好的 proxy
   */
  if (reactiveSet.has(target)) {
    return target
  }

  if (reactiveMap.has(target)) {
    return reactiveMap.get(target)
  }

  const proxy = new Proxy(target, mutableHandlers)

  reactiveMap.set(target, proxy)
  reactiveSet.add(proxy)

  return proxy
}

export function reactive<T>(target: T) {
  return createReactiveObject(target)
}

export function isReactive<T>(target: T) {
  return reactiveSet.has(target)
}
