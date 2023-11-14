import nodeId from './node-id.mjs'
import subTree from './sub-tree.mjs'
import sha224 from '../crypto/sha224.mjs'
/** @typedef {import('./sub-tree.mjs').State} SubTreeState */
const { byteToNodeId } = nodeId
const { newState: newSubTree, push: pushSubTree, end: endSubTree } = subTree
const { compress } = sha224

/**
 * @typedef {SubTreeState[]} State
 */

const mask224 = ((1n << 224n) - 1n)

/** @type {(state: State) => (nu8: number) => void} */
const push = state => nu8 => pushNodeId(state)(byteToNodeId(nu8))

/** @type {(state: State) => (bu256: bigint) => void} */
const pushNodeId = state => last0 => {
    let i = 0
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
const end = state => compress(internalEnd(state)) & mask224

/** @type {(state: State) => bigint | null} */
const partialEnd = state => {
    let nodeId = internalEnd(state)
    if (nodeId >> 224n !== 0xffff_ffffn) {
        return null
    }
    return nodeId & mask224
}

/** @type {(state: State) => bigint} */
const internalEnd = state => {
    let last0 = 0n
    for (let subTree of state) {
        last0 = endSubTree(subTree)(last0)
    }
    return last0
}

export default {
    push,
    pushNodeId,
    end,
    partialEnd
}