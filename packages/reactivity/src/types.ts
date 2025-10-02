import { ReactiveFlags } from './constants'

export interface Dependency {
  subs: Link
  subTail: Link
}

export interface Subscriber {
  deps: Link
  depsTail: Link
  tracking: boolean
  dirty?: boolean
  notify?: () => void
  update?: () => void
}

export interface Link {
  dep: Dependency | null
  sub: Subscriber | null
  nextDep: Link | null
  prevSub: Link | null
  nextSub: Link | null
}

export interface Ref<T = any> extends Dependency {
  [ReactiveFlags.IS_REF]: boolean
  _value: T | Record<string, any>
  value: T | Record<string, any>
}

export interface ComputedRef<T = any> extends Dependency, Subscriber {
  [ReactiveFlags.IS_REF]: boolean
  _value: T | Record<string, any>
  value: T | Record<string, any>
}

export interface Effect extends Subscriber {
  run: () => any
  schedule: () => void
}

export type ReactiveTarget = Record<string, any>
export type ReactiveProxy = Record<string, any>
