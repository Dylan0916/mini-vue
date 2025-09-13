export let activeSub = null

export function effect(fn) {
  activeSub = fn
  fn()
  activeSub = null
}
