import fs from 'node:fs'
import base32 from './base32.mjs'
import tree from './tree.mjs'
/** @typedef {import('./tree.mjs').State} StateTree */
const { toAddress } = base32
const { push: pushTree, end: endTree, partialEnd: partialEndTree } = tree

/**
 * second element is root flag
 * @typedef {readonly [string, boolean]} Address
 */

/** @type {(address: Address) => string} */
const getPath = ([address, isRoot]) => {
  const dir = isRoot ? 'roots' : 'parts'
  return `cdt0/${dir}/${address.substring(0, 2)}/${address.substring(2, 4)}/${address.substring(4)}`
}

/** @type {(buffer: Buffer) => (address: Address) => boolean} */
const verifyData = data => ([address, isRoot]) => {
    /** @type {StateTree} */
  let tree = []
  for (let byte of data) {
    pushTree(tree)(byte)
  }
  // console.log(`tree length = ${tree.length}`)
  // let s = tree.map(subTree => subTree.length.toString()).join(',')
  // console.log(s)
  const digest = isRoot ? endTree(tree) : partialEndTree(tree)
  if (digest === null) {
    return false
  }
  return toAddress(digest) === address
}

/** @type {(address: Address) => Buffer} */
const getBuffer = address => {
    const path = getPath(address)
    const data = fs.readFileSync(path)
    const tailLength = data[0]
    console.log(`tail length = ${tailLength}`)
    if (tailLength === 32) {
      const result = data.subarray(1)
      console.log(verifyData(result)(address))
      return result
    } else {
      const tail = data.subarray(1, tailLength + 1)
      let buffer = Buffer.from([])
      console.log(`tail = ${tail}`)
      for(let i = tailLength + 1; i < data.length; i += 28) {
        let hash = 0n
        for(let j = 0; j < 28; j++) {
          hash += BigInt(data[i + j]) << BigInt(8 * j)
        }
        console.log(hash)
        const childAddress = toAddress(hash)
        console.log(childAddress)
        buffer = Buffer.concat([buffer, getBuffer([childAddress, false])])
      }
      buffer = Buffer.concat([buffer, tail])
      return buffer
    }
}

/** @type {(root: string) => (file: string) => void} */
const get = root => file => {
  try {
    fs.writeFileSync(file, getBuffer([root, true]))
  } catch (err) {
    console.error(err);
  }
}

//get('mnb8j83rgrch8hgb8rbz28d64ec2wranzbzxcy4ebypd8')('out')
//get('2va87tc3cqebgg6wagd9dwe36e2vgcpdxjd26enj4c0xh')('out')
//get('d963x31mwgb8svqe0jmkxh8ar1f8p2dawebnan4aj6hvd')('out')
//get('vqfrc4k5j9ftnrqvzj40b67abcnd9pdjk62sq7cpbg7xe')('out')