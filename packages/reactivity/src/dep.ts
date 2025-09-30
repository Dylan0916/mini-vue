import { Dependency } from './models'
import { link, propagate } from './system'
import { activeSub } from './effect'
import type { ReactiveTarget } from './types'

const targetMap = new WeakMap<ReactiveTarget, Map<string | symbol, Dependency>>()

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
