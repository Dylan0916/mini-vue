import { hasChanged, isFunction } from '@vue/shared'

import { ReactiveFlags } from './constants'
import { Link, ComputedRef } from './types'
import { activeSub, setActiveSub } from './effect'
import { endTrack, link, startTrack } from './system'

class ComputedRefImpl<T> implements ComputedRef<T> {
  [ReactiveFlags.IS_REF] = true
  _value: T | Record<string, any>

  subs: Link | null = null
  subTail: Link | null = null

  deps: Link | null = null
  depsTail: Link | null = null

  tracking = false
  dirty = true

  constructor(public fn: () => T, private setter?: (value: T | Record<string, any>) => void) {}

  update() {
    const prevSub = activeSub

    setActiveSub(this)
    startTrack(this)
    try {
      const oldValue = this._value

      this._value = this.fn()
      this.dirty = false

      return hasChanged(this._value, oldValue)
    } finally {
      endTrack(this)
      setActiveSub(prevSub)
    }
  }

  notify() {}

  get value() {
    if (this.dirty) {
      this.update()
    }

    if (activeSub) {
      link(this, activeSub)
    }

    return this._value
  }

  set value(newValue) {
    if (this.setter) {
      this.setter(newValue)
    } else {
      console.warn('Computed value is readonly')
    }
  }
}

export function computed<T>(getterOptions: (() => T) | { get: () => T; set: (value: T) => void }) {
  let getter
  let setter

  if (isFunction(getterOptions)) {
    getter = getterOptions
  } else {
    getter = getterOptions.get
    setter = getterOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
