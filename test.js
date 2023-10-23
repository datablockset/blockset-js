const { getParityBit } = require('./index')

{
  const parity = getParityBit(0n)
  if (parity !== 0) { console.error(parity) }
}

{
  const parity = getParityBit(1n)
  if (parity !== 0) { console.error(parity) }
}