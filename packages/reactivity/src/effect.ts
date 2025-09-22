import type { Link, Sub } from './types'

export let activeSub: Sub | null = null

export class ReactiveEffect implements Sub {
  deps: Link = null
  depsTail: Link = null

  constructor(public fn: () => any) {}

  run() {
    const prevSub = activeSub

    activeSub = this
    this.depsTail = null
    try {
      return this.fn()
    } finally {
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

export function effect(fn: () => any, options?: Pick<Sub, 'schedule'>) {
  const effect = new ReactiveEffect(fn)

  Object.assign(effect, options)
  effect.run()

  const runner = () => effect.run()

  runner.effect = effect

  return runner
}
