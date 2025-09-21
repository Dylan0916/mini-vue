import { ReactiveFlags } from './constants'

export interface Link {
  dep: Dep | null
  sub: Sub | null
  nextDep: Link | null
  prevSub: Link | null
  nextSub: Link | null
}

export interface Dep<T = any> {
  [ReactiveFlags.IS_REF]: boolean
  _value: T
  subs: Link
  subTail: Link
  value: T
}

export interface Sub {
  deps: Link
  depsTail: Link
  run: () => any
  schedule: () => void
  notify: () => void
}
