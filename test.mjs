import index from './index.mjs'
import sha224 from './sha224.mjs'
const { getParityBit } = index
const { compress } = sha224

{
  const parity = getParityBit(0n)
  if (parity !== 0) { throw parity }
}

{
  const parity = getParityBit(1n)
  if (parity !== 1) { throw parity }
}

{
  const hash = compress(0x8000_0000n)
  const result = hash.toString(16)
  if (result !== 'ffffffffc5b3e42f828ea62a15a2b01f288234c4476102bb2a3a2bc9d14a028c') { throw result }
}