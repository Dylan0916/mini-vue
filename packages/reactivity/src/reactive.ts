import { isObject } from '@vue/shared'

import { link, propagate } from './system'
import { activeSub } from './effect'

export function track(target: Record<string, any>, key: string | symbol) {
  if (activeSub) {
    // link(target, activeSub)
  }
}

export function trigger(target: Record<string, any>, key: string | symbol) {
  //   if (dep.subs) {
  //     propagate(dep.subs)
  //   }
}

export function createReactiveObject<T>(target: T) {
  if (!isObject(target)) {
    return
  }

  return new Proxy(target, {
    get(target, key) {
      track(target, key)
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)

      trigger(target, key)

      return res
    },
  })
}

export function reactive<T>(target: T) {
  return createReactiveObject(target)
}
