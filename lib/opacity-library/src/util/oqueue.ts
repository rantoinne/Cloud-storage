import { extractPromise } from './promise'

export type OQWorkFn<S> = (n: number) => Promise<S> | S | void
export type OQCommitFn<S, T> = (wret: S | void, n: number) => Promise<T> | T

export class OQ<S, T = void> {
  // n is the serving finished index
  _n = -1
  // o is the checkout finished index
  _o = -1
  // u is the unfinished work count
  _u = 0

  // c is the current concurrency
  _c = 0
  // cl is the concurrency limit. the max number of concurrent work done at a time
  _cl: number
  // ct is the concurrency tolerance. the max distance from the committed entry that work will be done
  _ct: number

  _isClosed = false
  _closed: Promise<void>
  _resolveClosed: () => void

  _queue: [number, (v?: void) => void][] = []

  get concurrency() {
    return this._c
  }

  async waitForClose() {
    return await this._closed
  }

  async waitForLine(size: number) {
    const [promise, resolve] = extractPromise()

    if (this._u - 1 <= size) {
      resolve()
    }

    return promise
  }

  async waitForWork(n: number) {
    // console.log("waiting for service:", n, this._o)

    const [promise, resolve] = extractPromise()

    if (n <= this._n) {
      resolve()
    }

    return promise
  }

  async waitForWorkFinish(n: number) {
    // console.log("waiting for service:", n, this._o)

    const [promise, resolve] = extractPromise()

    if (n <= this._n) {
      resolve()
    }

    return promise
  }

  async waitForCommit(n: number) {
    // console.log("waiting for finish:", n, this._o)

    const [promise, resolve] = extractPromise()

    if (n <= this._o) {
      resolve()
    }

    return promise
  }

  constructor(concurrency = 1, tolerance = concurrency) {
    this._cl = concurrency
    this._ct = tolerance

    const [closed, resolveClosed] = extractPromise<void>()
    this._closed = closed
    this._resolveClosed = resolveClosed
  }

  async add(n: number, wfn: OQWorkFn<S>, cfn: OQCommitFn<S, T>) {
    if (this._isClosed) {
      return
    }

    const [workPromise, resolveReadyForWork] = extractPromise<void>()

    const i = this._queue.findIndex(([n2]) => n < n2)
    this._queue.splice(i === -1 ? this._queue.length : i, 0, [n, resolveReadyForWork])

    if (this._c < this._cl && this._queue[0][0] < this._o + 1 + this._ct) {
      this._queue[0][1]()

      this._queue.shift()
    }

    this._u++

    await workPromise

    if (this._isClosed) {
      return
    }

    this._u--
    this._c++

    const w = wfn(n)
    Promise.resolve(w).then(async () => {
      this._n++
      this._c--

      if (this._c < this._cl && this._queue[0]) {
        this._queue[0][1]()
      }

      this._queue.shift()
    })

    // wait for previous checkout
    await this.waitForCommit(n - 1)

    if (this._isClosed) {
      return
    }

    // console.log("checkout: " + n)

    const v = await cfn(await Promise.resolve(w), n)
    this._o++

    return v
  }

  close() {
    this._isClosed = true
    this._resolveClosed()
  }
}
