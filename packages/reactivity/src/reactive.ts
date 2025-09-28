import { isObject } from '@vue/shared'

import { Dependency } from './models'
import { link, propagate } from './system'
import { activeSub } from './effect'

const targetMap = new WeakMap<Record<string, any>, Map<string | symbol, Dependency>>()

export function track(target: Record<string, any>, key: string | symbol) {
  if (!activeSub) {
    return
  }

  let depsMap = targetMap.get(target)

  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)

  if (!dep) {
    dep = new Dependency()
    depsMap.set(key, dep)
  }

  link(dep, activeSub)
}

export function trigger(target: Record<string, any>, key: string | symbol) {
  const depsMap = targetMap.get(target)

  if (!depsMap) {
    return
  }

  const dep = depsMap.get(key)

  if (!dep) {
    return
  }

  propagate(dep.subs)
}

export function createReactiveObject<T>(target: T) {
  if (!isObject(target)) {
    return
  }

  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, newValue, receiver) {
      const res = Reflect.set(target, key, newValue, receiver)

      trigger(target, key)

      return res
    },
  })
}

export function reactive<T>(target: T) {
  return createReactiveObject(target)
}
