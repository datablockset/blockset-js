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
 * @typedef {readonly Uint8Array[]} OkOutput
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

/**
 * @typedef {{
 * readonly read: (address: Address) => Promise<Uint8Array>,
 * readonly write: (path: string) => (buffer: Uint8Array) => Promise<void>,
 * }} Provider
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
  /** @type {Uint8Array[]} */
  let resultBuffer = []

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

    if (blockLast[0][0] === '') {
      resultBuffer.push(blockData)
      continue
    }

    /** @type {StateTree} */
    let verificationTree = []
    const tailLength = blockData[0]
    if (tailLength === 32) {
      const data = blockData.subarray(1)
      for (let byte of data) {
        pushTree(verificationTree)(byte)
      }
      resultBuffer.push(data)
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

/** @type {(hostName: string) => Provider} */
const fetchProvider = hostName => ({
  read: address => fetch(`https://${hostName}/${getPath(address)}`)
    .then(async (resp) => resp.arrayBuffer().then(buffer => new Uint8Array(buffer))),
    write: path => buffer => fsPromises.appendFile(path, buffer)
})

/** @type {Provider} */
const asyncFileProvider = {
  read: address => fsPromises.readFile(getPath(address)),
  write: path => buffer => fsPromises.appendFile(path, buffer)
}

/** @type {Provider} */
const syncFileProvider = {
  read: address => Promise.resolve(fs.readFileSync(getPath(address))),
  write: path => buffer => Promise.resolve(fs.appendFileSync(path, buffer))
}

// /** @type {Provider} */
// const getReadPromise2 = address => {
//   const path = getPath(address)
//   return fsPromises.access(path)
//     .then(() => fsPromises.readFile(path))
//     .catch(() => fetchProvider(path))
// }

/** @type {(provider: Provider) => (root: [string, string]) => Promise<number>} */
const get = ({ read, write }) => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  /** @type {State} */
  let state = [[[root, true], null]]
  /** @type {[Address, Promise<Uint8Array>] | null} */
  let readPromise = null
  /** @type {Promise<void> | null} */
  let writePromise = null
  try {
    while (true) {
      const blockLast = state.at(-1)
      if (blockLast === undefined) {
        if (writePromise === null) {
          return -1
        }
        await writePromise
        await fsPromises.rename(tempFile, file)
        return 0
      }

      if (readPromise !== null) {
        const data = await readPromise[1]
        insertBlock(state)([readPromise[0], data])
      }

      for (let i = state.length - 1; i >= 0; i--) {
        const blockLastI = state[i]
        if (blockLastI[1] === null) {
          const address = blockLastI[0]
          readPromise = [address, read(address)]
          break
        }
      }

      const next = nextState(state)
      if (next[0] === 'error') {
        console.error(`${next[1]}`)
        return -1
      }

      const writeData = next[1]
      for (let buffer of writeData) {
        if (writePromise === null) {
          writePromise = fsPromises.writeFile(tempFile, new Uint8Array())
        }
        writePromise = writePromise.then(() => write(tempFile)(buffer))
      }
    }
  } catch (err) {
    console.error(err);
    return -1
  }
}

export default {
  get,
  syncFileProvider,
  asyncFileProvider,
  fetchProvider
}