export class Dependency {
  subs: Link
  subTail: Link
}

export interface Link {
  dep: Dependency | null
  sub: Subscriber | null
  nextDep: Link | null
  prevSub: Link | null
  nextSub: Link | null
}

// export interface Ref<T = any> {
//   subs: Link
//   subTail: Link
//   [ReactiveFlags.IS_REF]: boolean
//   _value: T
//   value: T
// }

export interface Subscriber {
  deps: Link
  depsTail: Link
  tracking: boolean
  run: () => any
  schedule: () => void
  notify: () => void
}
