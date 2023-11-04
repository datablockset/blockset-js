import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import base32 from './base32.mjs'
import tree from './tree.mjs'
import digest256 from './digest256.mjs'
/** @typedef {import('./tree.mjs').State} StateTree */
/**
 * @template T
 * @typedef {import('./subtree.mjs').Nullable<T>} Nullable
 */
const { toAddress } = base32
const { push: pushTree, end: endTree, partialEnd: partialEndTree, pushDigest } = tree
const { tailToDigest } = digest256

/**
 * second element is root flag
 * @typedef {readonly [string, boolean]} Address
 */

/**
 * @typedef {[Address, Uint8Array]} Block
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
 * @typedef {Nullable<Uint8Array>} OkOutput
 */

/**
 * @typedef { Result<OkOutput,string> } Output
*/

/**
 * @typedef { Uint8Array } ReadonlyUint8Array
 */

/**
 * @typedef {[Address, Nullable<ReadonlyUint8Array>]} BlockState
 */

/**
 * @typedef { BlockState[] } State
*/

/** @type {(address: Address) => string} */
const getPath = ([address, isRoot]) => {
  const dir = isRoot ? 'roots' : 'parts'
  return `cdt0/${dir}/${address.substring(0, 2)}/${address.substring(2, 4)}/${address.substring(4)}`
}

/** @type {(state: State) => (block: Block) => void} */
const insertBlock = state => block => {
  for (let i = 0; i < state.length; i++) {
    if (state[i][0][0] === block[0][0]) {
      state[i][1] = block[1]
    }
  }
}

/** @type {(state: State) =>  Output} */
const nextState = state => {
  let resultBuffer = new Uint8Array()

  while (true) {
    const blockLast = state.at(-1)
    if (blockLast === undefined) {
      return ['ok', resultBuffer]
    }

    const blockData = blockLast[1]
    if (blockData === null) {
      return ['ok', resultBuffer]
    }

    state.pop()

    /** @type {StateTree} */
    let verificationTree = []
    const tailLength = blockData[0]
    if (tailLength === 32) {
      const data = blockData.subarray(1)
      for (let byte of data) {
        pushTree(verificationTree)(byte)
      }
      resultBuffer = new Uint8Array([...resultBuffer, ...data]);
    } else {
      const tail = blockData.subarray(1, tailLength + 1)
      if (tail.length !== 0) {
        state.push([['', false], tail])
      }
      /** @type {Address[]} */
      let childAddresses = []
      for (let i = tailLength + 1; i < blockData.length; i += 28) {
        let hash = 0n
        for (let j = 0; j < 28; j++) {
          hash += BigInt(blockData[i + j]) << BigInt(8 * j)
        }
        pushDigest(verificationTree)(hash | (0xffff_ffffn << 224n))
        const childAddress = toAddress(hash)
        childAddresses.push([childAddress, false])
      }
      pushDigest(verificationTree)(tailToDigest(tail))
      const digest = blockLast[0][1] ? endTree(verificationTree) : partialEndTree(verificationTree)
      if (digest === null || toAddress(digest) !== blockLast[0][0]) {
        return ['error', `verification failed ${blockLast[0][0]}`]
      }

      for (let i = childAddresses.length - 1; i >= 0; i--) {
        state.push([childAddresses[i], null])
      }
    }
  }
}

/** @type {(root: [string, string]) => Promise<number>} */
async function getAsync([root, file]) {
  /** @type {State} */
  let state = [[[root, true], null]]
  let buffer = new Uint8Array()
  /** @type {[Address, Promise<Uint8Array>] | null} */
  let readPromise = null
  try {
    while (true) {
      const blockLast = state.at(-1)
      if (blockLast === undefined) {
        fs.writeFileSync(file, buffer)
        return 0
      }

      if (readPromise !== null) {
        const data = await readPromise[1]
        insertBlock(state)([readPromise[0], data])
      }

      //todo: move to sync function
      if (blockLast[1] === null) {
        const address = blockLast[0]
        const path = getPath(address)
        readPromise = [address, fsPromises.readFile(path)]
        continue
      } else {
        const blockLast1 = state.at(-2)
        if (blockLast1 !== undefined) {
          const address = blockLast1[0]
          const path = getPath(address)
          readPromise = [address, fsPromises.readFile(path)]
        }
      }

      console.log('call next state')
      const next = nextState(state)
      if (next[0] === 'error') {
        console.error(`${next[1]}`)
        return -1
      }

      if (next[1] !== null) {
        buffer = new Uint8Array([...buffer, ...next[1]]);
      }
    }
  } catch (err) {
    console.error(err);
    return -1
  }
}

/** @type {(root: string) => (file: string) => number} */
const get = root => file => {
  /** @type {State} */
  let state = [[[root, true], null]]
  let buffer = new Uint8Array()
  try {
    while (true) {
      const blockLast = state.at(-1)
      if (blockLast === undefined) {
        fs.writeFileSync(file, buffer)
        return 0
      }

      const address = blockLast[0]
      const path = getPath(address)
      console.log('read file ' + path)
      const data = fs.readFileSync(path)
      insertBlock(state)([address, data])
      const next = nextState(state)
      if (next[0] === 'error') {
        console.error(`${next[1]}`)
        return -1
      }

      if (next[1] !== null) {
        buffer = new Uint8Array([...buffer, ...next[1]]);
      }
    }
  } catch (err) {
    console.error(err);
    return -1
  }
}

export default {
  get,
  getAsync
}

//get('mnb8j83rgrch8hgb8rbz28d64ec2wranzbzxcy4ebypd8')('out')
//get('vqra44skpkefw4bq9k96xt9ks84221dmk1pzaym86cqd6')('out')
//get('d963x31mwgb8svqe0jmkxh8ar1f8p2dawebnan4aj6hvd')('out')
//get('vqfrc4k5j9ftnrqvzj40b67abcnd9pdjk62sq7cpbg7xe')('out')
//get('awt9x8564999k276wap2e5b7n10575ffy946kencva4ve')('out')
getAsync(['awt9x8564999k276wap2e5b7n10575ffy946kencva4ve', 'out'])