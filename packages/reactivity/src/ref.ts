class RefImpl {
  _value

  constructor(value) {
    this._value = value
  }

  get value() {
    return this._value
  }

  set value(newVal) {
    this._value = newVal
  }
}

export function ref(value) {
  return new RefImpl(value)
}
