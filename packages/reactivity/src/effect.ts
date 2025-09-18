import { type Effect } from './types'

export let activeSub: Effect | null = null

export class ReactiveEffect implements Effect {
  constructor(public fn: () => any) {}

  run() {
    const prevSub = activeSub

    activeSub = this
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

export function effect(fn: () => any, options?: Pick<Effect, 'schedule'>) {
  const effect = new ReactiveEffect(fn)

  Object.assign(effect, options)
  effect.run()

  const runner = () => effect.run()

  runner.effect = effect

  return runner
}
