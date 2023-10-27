import digest256 from './digest256.mjs'
const { merge } = digest256

/**
 * @typedef {readonly [bigint, bigint, bigint]} Node
 */

const nodeRoot = 0
const nodeLast = 1
const nodeHeight = 2

/** @typedef {Node[]} State */

/**
 * @template T
 * @typedef {null | T} Nullable
 */

/** @type {(bu256: bigint) => bigint} */
const highestOne256 = bu256 => {
    if (bu256 === 0n) { return 0n }
    let result = 1n
    let index = 128n
    while (true) {
        const high = bu256 >> index
        if (high === 0n) {
            bu256 &= (1n << index) - 1n
        } else {
            bu256 = high
            result += index
        }
        if (index === 1n) { return result }
        index >>= 1n
    }
}

/** @type {(bu256: bigint) => bigint} */
const leadingZero256 = bu256 => 256n - highestOne256(bu256)

/** @type {(a: bigint) => (b: bigint) => bigint} */
const height = a => b => {
    let v = a ^ b
    return leadingZero256(v)
}

/** @type {(state: State) => (last0: bigint) => bigint} */
const end = state => last0 => {
    while (true) {
        let last1 = state.pop()
        if (last1 === undefined) {
            return last0
        }
        last0 = merge(last1[nodeRoot])(last0)
    }
}

/** @type {(state: State) => (last0: bigint) => Nullable<bigint>} */
const push = state => last0 => {
    let height10 = 0n
    let last1 = state.pop()
    if (last1 !== undefined) {
        if (last0 >= last1[nodeLast]) {
            return end(state)(merge(last1[nodeRoot])(last0))
        }
        height10 = height(last1[nodeLast])(last0)
        while (last1[nodeHeight] > height10) {
            let last2 = state.pop()
            if (last2 === undefined) throw 'invalid state'
            last1 = [
                merge(last2[nodeRoot])(last1[nodeRoot]),
                last1[nodeLast],
                last2[nodeHeight]
            ]
        }
        state.push(last1)
    }
    state.push([last0, last0, height10])
    return null
}

export default {
    highestOne256,
    height,
    push
}