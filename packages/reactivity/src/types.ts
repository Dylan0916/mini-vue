import { ReactiveFlags } from './constants'

export interface Link {
  dep: Dependency | null
  sub: Subscriber | null
  nextDep: Link | null
  prevSub: Link | null
  nextSub: Link | null
}

export interface Dependency<T = any> {
  [ReactiveFlags.IS_REF]: boolean
  _value: T
  subs: Link
  subTail: Link
  value: T
}

export interface Subscriber {
  deps: Link
  depsTail: Link
  tracking: boolean
  run: () => any
  schedule: () => void
  notify: () => void
}
