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
    let result = 0n
    let index = 256n
    while (bu256 !== 0n) {
        index >>= 1n
        if (index === 0n) {
            return result + 1n
        }
        const high = bu256 >> index
        if (high === 0n) {
            bu256 &= (1n << index) - 1n
        } else {
            bu256 = high
            result += index
        }
    }
    return result
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