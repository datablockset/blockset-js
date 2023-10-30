import fs from 'node:fs'
import base32 from './base32.mjs'
import tree from './tree.mjs'
import digest256 from './digest256.mjs'
/** @typedef {import('./tree.mjs').State} StateTree */
const { toAddress } = base32
const { push: pushTree, end: endTree, partialEnd: partialEndTree, pushDigest } = tree
const { tailToDigest } = digest256

/**
 * second element is root flag
 * @typedef {readonly [string, boolean]} Address
 */

/** @type {(address: Address) => string} */
const getPath = ([address, isRoot]) => {
  const dir = isRoot ? 'roots' : 'parts'
  return `cdt0/${dir}/${address.substring(0, 2)}/${address.substring(2, 4)}/${address.substring(4)}`
}

/** @type {(address: Address) => Buffer | string} */
const getBuffer = ([address, isRoot]) => {
  /** @type {StateTree} */
  let verificationTree = []
  const path = getPath([address, isRoot])
  const data = fs.readFileSync(path)
  const tailLength = data[0]
  /** @type {Buffer} */
  let result = Buffer.from([])
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
      result = Buffer.concat([result, childBuffer])
    }
    pushDigest(verificationTree)(tailToDigest(tail))
    result = Buffer.concat([result, tail])
  }
  const digest = isRoot ? endTree(verificationTree) : partialEndTree(verificationTree)
  if (digest === null || toAddress(digest) !== address) {
    return address
  }
  return result
}

/** @type {(root: string) => (file: string) => void} */
const get = root => file => {
  try {
    const buffer = getBuffer([root, true])
    if (typeof buffer === 'string') {
      console.error(`corrupted file with address ${buffer}`)
      return
    }
    fs.writeFileSync(file, buffer)
  } catch (err) {
    console.error(err);
  }
}

export default {
  get
}

//get('mnb8j83rgrch8hgb8rbz28d64ec2wranzbzxcy4ebypd8')('out')
//get('vqra44skpkefw4bq9k96xt9ks84221dmk1pzaym86cqd6')('out')
//get('d963x31mwgb8svqe0jmkxh8ar1f8p2dawebnan4aj6hvd')('out')
//get('vqfrc4k5j9ftnrqvzj40b67abcnd9pdjk62sq7cpbg7xe')('out')