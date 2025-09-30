import { startTrack, endTrack } from './system'
import type { Link, Subscriber } from './types'

export let activeSub: Subscriber | null = null

export class ReactiveEffect implements Subscriber {
  deps: Link = null
  depsTail: Link = null
  tracking = false

  constructor(public fn: () => any) {}

  run() {
    const prevSub = activeSub

    activeSub = this
    startTrack(this)
    try {
      return this.fn()
    } finally {
      endTrack(this)
      activeSub = prevSub
    }
  }

  schedule() {
    this.run()
  }

  notify() {
    this.schedule()
  }
}

export function effect(fn: () => any, options?: Pick<Subscriber, 'schedule'>) {
  const effect = new ReactiveEffect(fn)

  Object.assign(effect, options)
  effect.run()

  const runner = () => effect.run()

  runner.effect = effect

  return runner
}
