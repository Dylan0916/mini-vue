export enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

export interface Link {
  sub: Effect
  nextSub: Link
  prevSub: Link
}

export interface ReactiveRef<T = any> {
  [ReactiveFlags.IS_REF]: boolean
  _value: T
  subs: Link
  subTail: Link
  value: T
}

export interface Effect {
  run: () => any
  schedule: () => void
  notify: () => void
}
