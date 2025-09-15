import { activeSub } from './effect'

enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

interface Link {
  sub: () => any
  nextSub: Link
  prevSub: Link
}

class RefImpl {
  [ReactiveFlags.IS_REF] = true
  _value

  sub: Link
  subTail: Link

  constructor(value) {
    this._value = value
  }

  private createLink(sub: Link['sub']) {
    return {
      sub,
      nextSub: null,
      prevSub: null,
    }
  }

  private track() {
    if (activeSub) {
      const newLink = this.createLink(activeSub)

      if (this.subTail) {
        this.subTail.nextSub = newLink
        newLink.prevSub = this.subTail
      } else {
        this.sub = newLink
      }

      this.subTail = newLink
    }
  }

  private trigger() {
    const queuedEffect = []
    let link = this.sub

    while (link) {
      queuedEffect.push(link.sub)
      link = link.nextSub
    }

    queuedEffect.forEach(sub => {
      if (typeof sub === 'function') {
        sub()
      }
    })
  }

  get value() {
    this.track()

    return this._value
  }

  set value(newVal) {
    this._value = newVal
    this.trigger()
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF])
}
