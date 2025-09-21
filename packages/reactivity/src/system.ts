import type { Link, Dep, Sub } from './types'

function _createLink(dep: Dep, sub: Sub): Link {
  return {
    dep,
    sub,
    nextDep: null,
    nextSub: null,
    prevSub: null,
  }
}

function _appendDepLink(sub: Sub, newLink: Link) {
  if (sub.depsTail) {
    sub.depsTail.nextSub = newLink
    newLink.prevSub = sub.depsTail
  } else {
    sub.deps = newLink
  }
  sub.depsTail = newLink
}

function _appendSubLink(dep: Dep, newLink: Link) {
  if (dep.subTail) {
    dep.subTail.nextSub = newLink
    newLink.prevSub = dep.subTail
  } else {
    dep.subs = newLink
  }
  dep.subTail = newLink
}

export function link(dep: Dep, sub: Sub) {
  const currentDep = sub.depsTail
  const isLinkReuse = sub.deps && currentDep === null

  if (isLinkReuse) {
    if (sub.deps.dep === dep) {
      sub.depsTail = sub.deps
      return
    }
  }

  const newLink = _createLink(dep, sub)

  _appendDepLink(sub, newLink)
  _appendSubLink(dep, newLink)
}

export function propagate(subs: Link) {
  const queuedEffect: Sub[] = []
  let link = subs

  while (link) {
    queuedEffect.push(link.sub)
    link = link.nextSub
  }

  queuedEffect.forEach(sub => {
    sub.notify()
  })
}
