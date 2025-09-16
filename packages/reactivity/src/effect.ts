import { type Effect } from './types'

export let activeSub: Effect | null = null

export class ReactiveEffect implements Effect {
  constructor(public fn: () => any) {}

  run() {
    activeSub = this
    try {
      return this.fn()
    } finally {
      activeSub = null
    }
  }
}

export function effect(fn: () => any) {
  const effect = new ReactiveEffect(fn)

  effect.run()
}
