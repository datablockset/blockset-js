import fs from 'node:fs'
import base32 from './base32.mjs'
const { toAddress } = base32

/** @type {(hash: string) => string} */
const getPath = hash => `${hash.substring(0, 2)}/${hash.substring(2, 4)}/${hash.substring(4)}`

/** @type {(root: string) => Buffer} */
const getBuffer = root => {
    const data = fs.readFileSync(`cdt0/${root}`)
    const tailLength = data[0]
    console.log(`tail length = ${tailLength}`)
    if (tailLength === 32) {
      return data.subarray(1)
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
        const address = toAddress(hash)
        console.log(address)
        buffer = Buffer.concat([buffer, getBuffer(`parts/${getPath(address)}`)])
      }
      buffer = Buffer.concat([buffer, tail])
      return buffer
    }
}

/** @type {(root: string) => (file: string) => void} */
const get = root => file => {
  try {
    fs.writeFileSync(file, getBuffer(`roots/${getPath(root)}`))
  } catch (err) {
    console.error(err);
  }
}

//get('mnb8j83rgrch8hgb8rbz28d64ec2wranzbzxcy4ebypd8')('out')
//get('2va87tc3cqebgg6wagd9dwe36e2vgcpdxjd26enj4c0xh')('out')
//get('d963x31mwgb8svqe0jmkxh8ar1f8p2dawebnan4aj6hvd')('out')