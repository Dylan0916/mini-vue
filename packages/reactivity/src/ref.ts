import { type Link, type ReactiveRef, ReactiveFlags } from './types'
import { activeSub } from './effect'
import { link, propagate } from './system'

function trackRef(dep: ReactiveRef) {
  if (activeSub) {
    link(dep, activeSub)
  }
}

function triggerRef(dep: ReactiveRef) {
  if (dep.subs) {
    propagate(dep.subs)
  }
}

class RefImpl<T> implements ReactiveRef<T> {
  [ReactiveFlags.IS_REF] = true
  _value: T

  subs: Link
  subTail: Link

  constructor(value: T) {
    this._value = value
  }

  get value() {
    trackRef(this)

    return this._value
  }

  set value(newVal) {
    this._value = newVal
    triggerRef(this)
  }
}

export function ref<T>(value: T) {
  return new RefImpl(value)
}

export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF])
}
