import type { ComputedRef, Dependency, Link, Subscriber } from './types'

let linkPool: Link | null = null

function _createLink(dep: Dependency, sub: Subscriber, nextDep: Link | null): Link {
  let newLink = {
    dep,
    sub,
    nextDep,
    nextSub: null,
    prevSub: null,
  }

  if (linkPool) {
    newLink = linkPool
    linkPool = linkPool.nextDep
    newLink.dep = dep
    newLink.sub = sub
    newLink.nextDep = nextDep
  }

  return newLink
}

function _appendDepLink(sub: Subscriber, newLink: Link) {
  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink
  } else {
    sub.deps = newLink
  }
  sub.depsTail = newLink
}

function _appendSubLink(dep: Dependency, newLink: Link) {
  if (dep.subTail) {
    dep.subTail.nextSub = newLink
    newLink.prevSub = dep.subTail
  } else {
    dep.subs = newLink
  }
  dep.subTail = newLink
}

export function link(dep: Dependency, sub: Subscriber) {
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

// @FIXME: type
export function processComputedUpdate(sub: any) {
  sub.update()
  propagate(sub.subs)
}

export function propagate(subs: Link) {
  const queuedEffect: Subscriber[] = []
  let link = subs

  while (link) {
    const { sub } = link

    if (!sub.tracking) {
      // 如果 link.sub有 update 方法，表是傳入的是 computed
      if ('update' in sub) {
        processComputedUpdate(sub)
      } else {
        queuedEffect.push(sub)
      }
    }

    link = link.nextSub
  }

  queuedEffect.forEach(sub => {
    sub.notify()
  })
}

function clearTracking(link: Link) {
  if (!link) {
    return
  }

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

  /**
   * 把不要的節點放回 linkPool 去復用
   */
  link.nextDep = linkPool
  linkPool = link

  // 處理下一個要移除的節點
  clearTracking(nextDep)
}

export function startTrack(sub: Subscriber) {
  sub.depsTail = null
  sub.tracking = true
}

export function endTrack(sub: Subscriber) {
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

  sub.tracking = false
}
