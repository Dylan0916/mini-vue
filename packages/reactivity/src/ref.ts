import { activeSub } from './effect'

enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

class RefImpl {
  [ReactiveFlags.IS_REF] = true
  _value
  _sub = new Set()

  constructor(value) {
    this._value = value
  }

  get value() {
    if (activeSub) {
      this._sub.add(activeSub)
    }

    return this._value
  }

  set value(newVal) {
    this._value = newVal
    this._sub.forEach(sub => {
      if (typeof sub === 'function') {
        sub()
      }
    })
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF])
}
