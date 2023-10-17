const fs = require('fs')

/** @type {(uint5: number) => string} */
const toBase32 = uint5 => '0123456789abcdefghjkmnpqrstvwxyz'[uint5]

/** @type {(uint5: number) => number} */
const getParityBit = uint5 => (uint5 ^ (uint5 >> 1) ^ (uint5 >> 2) ^ (uint5 >> 3) ^ (uint5 >> 4)) & 1

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
      for(let i = 1; i < data.length; i += 28) {
        let hash = 0n
        for(let j = 0; j < 28; j++) {
          hash += BigInt(data[i + j]) << BigInt(8 * j)
        }
        console.log(hash)
        let address = ''
        let parity = 0
        for(let j = 0; j < 45; j++) {
          let uint5 = Number(hash & 0b11111n)
          parity ^= getParityBit(uint5)
          if (j == 44) {
            uint5 += parity << 4
          }
          address += toBase32(uint5)
          hash >>= 5n
        }
        console.log(address)
        buffer = Buffer.concat([buffer, getBuffer(`_${address}`)])
      }
      buffer = Buffer.concat([buffer, tail])
      return buffer
    }
}

/** @type {(root: string) => (file: string) => void} */
const get = root => file => {
  try {
    fs.writeFileSync(file, getBuffer(root))
  } catch (err) {
    console.error(err);
  }
}

//get('mnb8j83rgrch8hgb8rbz28d64ec2wranzbzxcy4ebypd8')('out')
get('2va87tc3cqebgg6wagd9dwe36e2vgcpdxjd26enj4c0xh')('out')