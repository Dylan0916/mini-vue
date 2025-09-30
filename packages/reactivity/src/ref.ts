import { isObject, hasChanged } from '@vue/shared'

import { Dependency, Ref } from './models'
import { ReactiveFlags } from './constants'
import { activeSub } from './effect'
import { link, propagate } from './system'
import { reactive } from './reactive'

function trackRef(dep: Dependency) {
  if (activeSub) {
    link(dep, activeSub)
  }
}

function triggerRef(dep: Dependency) {
  if (dep.subs) {
    propagate(dep.subs)
  }
}

class RefImpl<T> extends Dependency implements Ref<T> {
  [ReactiveFlags.IS_REF] = true
  _value: T | Record<string, any>

  constructor(value: T) {
    super()
    this._value = this._toReactive(value)
  }

  private _toReactive(value: T | Record<string, any>) {
    return isObject(value) ? reactive(value) : value
  }

  get value() {
    trackRef(this)

    return this._value
  }

  set value(newValue) {
    const oldValue = this._value

    if (hasChanged(newValue, oldValue)) {
      this._value = this._toReactive(newValue)
      triggerRef(this)
    }
  }
}

export function ref<T>(value: T) {
  return new RefImpl(value)
}

export function isRef(value: any): value is Ref {
  return !!(value && value[ReactiveFlags.IS_REF])
}
