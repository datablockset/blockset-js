import fs from 'node:fs'
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
 * @typedef {readonly [Nullable<Uint8Array>, Nullable<Address>]} OkOutput
 */

/**
 * @typedef { Result<OkOutput,string> } Output
*/

/**
 * @typedef {[Address, Nullable<Uint8Array>]} BlockState
 */

/**
 * @typedef { BlockState[] } State
*/

/** @type {(address: Address) => string} */
const getPath = ([address, isRoot]) => {
  const dir = isRoot ? 'roots' : 'parts'
  return `cdt0/${dir}/${address.substring(0, 2)}/${address.substring(2, 4)}/${address.substring(4)}`
}

/** @type {(address: Address) => Uint8Array | string} */
const getBuffer = ([address, isRoot]) => {
  /** @type {StateTree} */
  let verificationTree = []
  const path = getPath([address, isRoot])
  const data = fs.readFileSync(path)
  const tailLength = data[0]
  let result = new Uint8Array()
  if (tailLength === 32) {
    result = data.subarray(1)
    for (let byte of result) {
      pushTree(verificationTree)(byte)
    }
  } else {
    const tail = data.subarray(1, tailLength + 1)
    for (let i = tailLength + 1; i < data.length; i += 28) {
      let hash = 0n
      for (let j = 0; j < 28; j++) {
        hash += BigInt(data[i + j]) << BigInt(8 * j)
      }
      pushDigest(verificationTree)(hash | (0xffff_ffffn << 224n))
      const childAddress = toAddress(hash)
      const childBuffer = getBuffer([childAddress, false])
      if (typeof childBuffer === 'string') {
        return childBuffer
      }
      result = new Uint8Array([...result, ...childBuffer]);
    }
    pushDigest(verificationTree)(tailToDigest(tail))
    result = new Uint8Array([...result, ...tail]);
  }
  const digest = isRoot ? endTree(verificationTree) : partialEndTree(verificationTree)
  if (digest === null || toAddress(digest) !== address) {
    return address
  }
  return result
}

/** @type {(state: State) => (block: Block) => boolean} */
const insertBlock = state => block => {
  for(let i = 0; i < state.length; i++) {
    if (state[i][0][0] === block[0][0]) {
      state[i][1] = block[1]
      return true
    }
  }
  return false
}

/** @type {(state: State) => (block: Block) => Output} */
const nextState = state => block => {
  if (state.length === 0) {
    state.push(block)
  } else if (!insertBlock(state)(block)) {
    return ['error', 'unknown address']
  }

  const blockLast = state.at(-1)
  if (blockLast === undefined) {
    throw 'unexpected behaviour'
  }
  const data = blockLast[1]
  if(data === null) {
    return ['ok', [null, blockLast[0]]]
  }

  state.pop()

  //todo: implement logic from getBuffer
  //todo: push hashes as addresses to state
  //todo: add tail to State as BlockState with reserved address

  throw 'not implemented'
}

/** @type {(root: string) => (file: string) => number} */
const get = root => file => {
  try {
    const buffer = getBuffer([root, true])
    if (typeof buffer === 'string') {
      console.error(`corrupted file with address ${buffer}`)
      return -1
    }
    fs.writeFileSync(file, buffer)
  } catch (err) {
    console.error(err);
    return -1
  }
  return 0
}

export default {
  get
}

//get('mnb8j83rgrch8hgb8rbz28d64ec2wranzbzxcy4ebypd8')('out')
//get('vqra44skpkefw4bq9k96xt9ks84221dmk1pzaym86cqd6')('out')
//get('d963x31mwgb8svqe0jmkxh8ar1f8p2dawebnan4aj6hvd')('out')
//get('vqfrc4k5j9ftnrqvzj40b67abcnd9pdjk62sq7cpbg7xe')('out')