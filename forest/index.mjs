import base32 from '../crypto/base32.mjs'
import mainTree from '../cdt/main-tree.mjs'
import nodeId from '../cdt/node-id.mjs'
/** @typedef {import('../cdt/main-tree.mjs').State} StateTree */
/**
 * @template T
 * @typedef {import('../cdt/sub-tree.mjs').Nullable<T>} Nullable
 */
const { toBase32Hash } = base32
const { push: pushTree, end: endTree, partialEnd: partialEndTree, pushNodeId } = mainTree
const { tailToNodeId } = nodeId

/**
 * second element is root flag
 * @typedef {readonly [string, boolean]} ForestNodeId
 */

/**
 * @typedef {[ForestNodeId, Uint8Array]} ForestNode
 */

/**
 * @template T
 * @typedef {readonly['ok', T]} Ok
 */

/**
 * @template E
 * @typedef {readonly['error', E]} Error
 */

/**
 * @template T
 * @template E
 * @typedef {Ok<T>|Error<E>} Result
 */

/**
 * @typedef {readonly Uint8Array[]} OkOutput
 */

/**
 * @typedef { Result<OkOutput,string> } Output
*/

/**
 * @typedef { Uint8Array } ReadonlyUint8Array
 */

/**
 * @typedef {[ForestNodeId, Nullable<ReadonlyUint8Array>]} ForestNodeState
 */

/**
 * @typedef { ForestNodeState[] } State
*/

/**
 * @typedef {{
 * readonly read: (address: ForestNodeId) => Promise<Uint8Array>,
 * readonly write: (buffer: Uint8Array) => Promise<void>,
 * }} Provider
*/

/** @type {(state: State) => (forestNode: ForestNode) => void} */
const insertForestNode = state => forestNode => {
  for (let i = 0; i < state.length; i++) {
    if (state[i][0][0] === forestNode[0][0]) {
      state[i][1] = forestNode[1]
    }
  }
}

/** @type {(state: State) =>  Output} */
const nextState = state => {
  /** @type {Uint8Array[]} */
  let resultBuffer = []

  while (true) {
    const forestNodeLast = state.at(-1)
    if (forestNodeLast === undefined) {
      return ['ok', resultBuffer]
    }

    const forestNodeData = forestNodeLast[1]
    if (forestNodeData === null) {
      return ['ok', resultBuffer]
    }

    state.pop()

    if (forestNodeLast[0][0] === '') {
      resultBuffer.push(forestNodeData)
      continue
    }

    /** @type {StateTree} */
    let verificationTree = []
    const tailLength = forestNodeData[0]
    if (tailLength === 32) {
      const data = forestNodeData.subarray(1)
      for (let byte of data) {
        pushTree(verificationTree)(byte)
      }
      resultBuffer.push(data)
    } else {
      const tail = forestNodeData.subarray(1, tailLength + 1)
      if (tail.length !== 0) {
        state.push([['', false], tail])
      }
      /** @type {ForestNodeId[]} */
      let children = []
      for (let i = tailLength + 1; i < forestNodeData.length; i += 28) {
        let forestNodeHash = 0n
        for (let j = 0; j < 28; j++) {
          forestNodeHash += BigInt(forestNodeData[i + j]) << BigInt(8 * j)
        }
        pushNodeId(verificationTree)(forestNodeHash | (0xffff_ffffn << 224n))
        const childBase32Hash = toBase32Hash(forestNodeHash)
        children.push([childBase32Hash, false])
      }
      pushNodeId(verificationTree)(tailToNodeId(tail))
      const forestNodeHash = forestNodeLast[0][1] ? endTree(verificationTree) : partialEndTree(verificationTree)
      if (forestNodeHash === null || toBase32Hash(forestNodeHash) !== forestNodeLast[0][0]) {
        return ['error', `verification failed ${forestNodeLast[0][0]}`]
      }

      for (let i = children.length - 1; i >= 0; i--) {
        state.push([children[i], null])
      }
    }
  }
}

/** @type {(provider: Provider) => (root: string) => Promise<string | null>} */
const get = ({ read, write }) => async (root) => {
  /** @type {State} */
  let state = [[[root, true], null]]
  /** @type {[ForestNodeId, Promise<Uint8Array>] | null} */
  let readPromise = null
  /** @type {Promise<void> | null} */
  let writePromise = null
  try {
    while (true) {
      const nodeStateLast = state.at(-1)
      if (nodeStateLast === undefined) {
        if (writePromise === null) {
          return 'unexpected behaviour'
        }
        await writePromise
        return null
      }

      if (readPromise !== null) {
        const data = await readPromise[1]
        insertForestNode(state)([readPromise[0], data])
      }

      for (let i = state.length - 1; i >= 0; i--) {
        const nodeStateLastI = state[i]
        if (nodeStateLastI[1] === null) {
          const nodeId = nodeStateLastI[0]
          readPromise = [nodeId, read(nodeId)]
          break
        }
      }

      const next = nextState(state)
      if (next[0] === 'error') {
        return `${next[1]}`
      }

      const writeData = next[1]
      for (let buffer of writeData) {
        if (writePromise === null) {
          writePromise = Promise.resolve()
        }
        writePromise = writePromise.then(() => write(buffer))
      }
    }
  } catch (err) {
    return `${err}`
  }
}

export default {
  get
}