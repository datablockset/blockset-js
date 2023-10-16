const fs = require('fs')

/** @type {(uint5: number) => string} */
const toBase32 = uint5 => '0123456789abcdefghjkmnpqrstvwxyz'[uint5]

/** @type {(root: string) => (file: string) => void} */
const get = root => file => {
  try {
    const data = fs.readFileSync(`cdt0/${root}`)
    const tailLength = data[0]
    console.log(`tail length = ${tailLength}`)
    if (tailLength === 32) {
      const out = data.subarray(1)
      fs.writeFileSync(file, out)
    } else {
      const tail = data.subarray(1, tailLength + 1)
      console.log(`tail = ${tail}`)
      for(let i = 1; i < data.length; i += 28) {
        let hash = 0n
        for(let j = 0; j < 28; j++) {
          hash += BigInt(data[i + j]) << BigInt(8 * j)
        }
        console.log(hash)
        let address = ''
        for(let j = 0; j < 45; j++) {
          address += toBase32(Number(hash & 0b11111n))
          hash >>= 5n
        }
        console.log(address)
      }
      console.error('not implemented')
    }
  } catch (err) {
    console.error(err);
  }
}

//get('mnb8j83rgrch8hgb8rbz28d64ec2wranzbzxcy4ebypd8')('out')
get('2va87tc3cqebgg6wagd9dwe36e2vgcpdxjd26enj4c0xh')('out')