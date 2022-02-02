import { applyPatch as mobxApplyPatch } from 'mobx-state-tree'

const TIMEOUT = 30 // in seconds

export function timeoutPromise(timeoutSeconds = TIMEOUT): Promise<never> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(Error('Network Timeout!'))
    }, timeoutSeconds * 1000)
  })
}

export function withTimeout<T>(promise: Promise<T>, timeoutSeconds?: number): Promise<T> {
  return Promise.race([promise, timeoutPromise(timeoutSeconds)])
}

// how to compensate for 5% difference inside the remaining 95%
export function getPercCompensator(num) {
  const reminderPerc = 100 - num
  const increasePerc = (num / reminderPerc) * 100
  return (increasePerc / reminderPerc) * 100
}

export function applyPatch(self: any, data: any) {
  mobxApplyPatch(
    self,
    Object.keys(data).map(key => ({
      op: 'replace' as PatchType,
      path: `/${key}`,
      value: data[key],
    })),
  )
}
