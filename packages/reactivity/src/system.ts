import type { Link, ReactiveRef, Effect } from './types'

function createLink(sub: Link['sub']): Link {
  return {
    sub,
    nextSub: null,
    prevSub: null,
  }
}

export function link(dep: ReactiveRef, activeSub: Effect) {
  const newLink = createLink(activeSub)

  if (dep.subTail) {
    dep.subTail.nextSub = newLink
    newLink.prevSub = dep.subTail
  } else {
    dep.subs = newLink
  }

  dep.subTail = newLink
}

export function propagate(subs: Link) {
  const queuedEffect: Effect[] = []
  let link = subs

  while (link) {
    queuedEffect.push(link.sub)
    link = link.nextSub
  }

  queuedEffect.forEach(sub => {
    sub.notify()
  })
}
