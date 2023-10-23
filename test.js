const { getParityBit } = require('./index')

{
  const parity = getParityBit(0n)
  if (parity !== 0) { throw parity }
}

{
  const parity = getParityBit(1n)
  if (parity !== 1) { throw parity }
}