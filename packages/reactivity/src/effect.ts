import { startTrack, endTrack } from './system'
import type { Effect, Link, Subscriber } from './types'

export let activeSub: Subscriber | null = null

export function setActiveSub(sub: Subscriber) {
  activeSub = sub
}

export class ReactiveEffect implements Effect {
  deps: Link = null
  depsTail: Link = null
  tracking = false

  constructor(public fn: () => any) {}

  run() {
    const prevSub = activeSub

    setActiveSub(this)
    startTrack(this)
    try {
      return this.fn()
    } finally {
      endTrack(this)
      setActiveSub(prevSub)
    }
  }

  schedule() {
    this.run()
  }

  notify() {
    this.schedule()
  }
}

export function effect(fn: () => any, options?: Pick<Effect, 'schedule'>) {
  const effect = new ReactiveEffect(fn)

  Object.assign(effect, options)
  effect.run()

  const runner = () => effect.run()

  runner.effect = effect

  return runner
}
