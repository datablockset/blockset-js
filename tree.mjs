import digest256 from './digest256.mjs'
import subtree from './subtree.mjs'
import sha224 from './sha224.mjs'
/** @typedef {import('./subtree.mjs').State} SubTreeState */
const { byteToDigest } = digest256
const { newState: newSubTree, push: pushSubTree, end: endSubTree } = subtree
const { compress } = sha224

/**
 * @typedef {SubTreeState[]} State
 */

/** @type {(state: State) => (nu8: number) => void} */
const push = state => nu8 => {
    let i = 0
    let last0 = byteToDigest(nu8)
    while (true) {
        let subTree = state[i]
        if (subTree === undefined) {
            state.push(newSubTree(last0))
            return
        }
        const last1 = pushSubTree(subTree)(last0)
        if (last1 === null) {
            return
        }
        last0 = last1
        i += 1
    }
}

/** @type {(state: State) => bigint} */
const end = state => {
    let last0 = 0n
    for (let subTree of state) {
        last0 = endSubTree(subTree)(last0)
    }
    return compress(last0)
}

export default {
    push,
    end
}