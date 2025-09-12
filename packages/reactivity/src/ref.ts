class RefImpl {
  _value

  constructor(value) {
    this._value = value
  }
}

export function ref(value) {
  return new RefImpl(value)
}
