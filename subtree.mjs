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

/** @type {(state: State) => (last0: bigint) => Nullable<bigint>} */
const end = state => last0 => {
    throw 'not implemented'
}

/** @type {(state: State) => (last0: bigint) => Nullable<bigint>} */
const push = state => last0Last => {
    let height10 = 0n
    let last1 = state.pop()
    if (last1 !== undefined) {
        if (last0Last >= last1[nodeLast]) {
            return end(state)(merge(last1[nodeRoot])(last0Last))
        }
        //height10 =
    }
    throw 'not implemented'
    //state.push([last0, height10])
    return null

}

export default {
    highestOne256
}