import type { Link, Dep, Sub } from './types'

function _createLink(dep: Dep, sub: Sub, nextDep: Link | null): Link {
  return {
    dep,
    sub,
    nextDep,
    nextSub: null,
    prevSub: null,
  }
}

function _appendDepLink(sub: Sub, newLink: Link) {
  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink
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
  const nextDep = currentDep === null ? sub.deps : currentDep.nextDep

  if (nextDep?.dep === dep) {
    sub.depsTail = nextDep
    return
  }

  const newLink = _createLink(dep, sub, nextDep)

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

function clearTracking(link: Link) {
  const { dep, nextDep, nextSub, prevSub } = link

  /**
   * 1. 如果有上一個節點，那就上一個節點的 nextSub 指向當前節點的下一個節點
   * 2. 如果沒有，表示屬於頭節點，那就把 dep.subs 指向當前節點的下一個節點
   */
  if (prevSub) {
    prevSub.nextSub = nextSub
    link.nextSub = null
  } else {
    dep.subs = nextSub
  }

  /**
   * 1. 如果有下一個節點，那就把下一個節點的 prevSub 指向當前節點的上一個節點
   * 2. 如果沒有，表示屬於尾節點，那就把 dep.subsTail 指向當前節點的上一個節點
   */
  if (nextSub) {
    nextSub.prevSub = prevSub
    link.prevSub = null
  } else {
    dep.subTail = prevSub
  }

  link.dep = null
  link.sub = null
  link.nextDep = null

  // 處理下一個要移除的節點
  // 這行好像沒作用 (?)
  link = nextDep
}

export function startTrack(sub: Sub) {
  sub.depsTail = null
}

export function endTrack(sub: Sub) {
  const { depsTail } = sub

  if (depsTail) {
    if (depsTail.nextDep) {
      clearTracking(depsTail.nextDep)
      depsTail.nextDep = null
    }
  } else if (sub.deps) {
    clearTracking(sub.deps)
    sub.deps = null
  }
}
