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
}

export function effect(fn: () => any) {
  const effect = new ReactiveEffect(fn)

  effect.run()
}
