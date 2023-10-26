import index from './index.mjs'
import sha224 from './sha224.mjs'
import digest256 from './digest256.mjs'
import subtree from './subtree.mjs'
/** @typedef {import('./subtree.mjs').State} State */
const { getParityBit } = index
const { compress } = sha224
const { merge, byteToDigest, len } = digest256
const { highestOne256, height, push } = subtree

console.log(`test start`)

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

{
  const a = byteToDigest(0x12)
  if (a !== 0x0800_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0012n) { throw a.toString(16) }
  const b = byteToDigest(0x34)
  if (b !== 0x0800_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0034n) { throw b.toString(16) }
  const lenA = len(a)
  if (lenA !== 8n) { throw lenA.toString(16) }

  const c = merge(a)(b)
  if (c !== 0x1000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_3412n) { throw c.toString(16) }

  const c2 = merge(c)(c)
  if (c2 !== 0x2000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_3412_3412n) { throw c2.toString(16) }

  const c4 = merge(c2)(c2)
  if (c4 !== 0x4000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_3412_3412_3412_3412n) { throw c4.toString(16) }

  const c8 = merge(c4)(c4)
  if (c8 !== 0x8000_0000_0000_0000_0000_0000_0000_0000_3412_3412_3412_3412_3412_3412_3412_3412n) { throw c8.toString(16) }

  const c12 = merge(c8)(c4)
  if (c12 !== 0xc000_0000_0000_0000_3412_3412_3412_3412_3412_3412_3412_3412_3412_3412_3412_3412n) { throw c12.toString(16) }

  const c16 = merge(c8)(c8)
  if (len(c16) !== 0xffn) { throw c16.toString(16) }

  {
    const result = merge(a)(0n)
    if (result !== a) { throw result }
  }

  {
    const result = merge(0n)(a)
    if (result !== a) { throw result }
  }
}

{
  {
    const result = highestOne256(0n)
    if (result !== 0n) { throw result }
  }

  {
    const result = highestOne256(1n)
    if (result !== 1n) { throw result }
  }

  {
    const result = highestOne256(2n)
    if (result !== 2n) { throw result }
  }

  {
    const result = highestOne256(3n)
    if (result !== 2n) { throw result }
  }

  {
    const result = highestOne256(4n)
    if (result !== 3n) { throw result }
  }

  {
    const result = highestOne256(8n)
    if (result !== 4n) { throw result }
  }

  {
    const result = highestOne256(8n)
    if (result !== 4n) { throw result }
  }

  {
    const result = highestOne256(0x8000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000n)
    if (result !== 256n) { throw result }
  }

  {
    const result = height(0n)(0n)
    if (result !== 256n) { throw result }
  }

  {
    const result = height(0n)(1n)
    if (result !== 255n) { throw result }
  }

  {
    const result = height(1n)(0n)
    if (result !== 255n) { throw result }
  }

  {
    const result = height(0n)(0x1_0000_0000_0000_0000_0000_0000_0000_0000n)
    if (result !== 127n) { throw result }
  }

  {
    const result = height(0x1_0000_0000_0000_0000_0000_0000_0000_0000n)(0x1_0000_0000_0000_0000_0000_0000_0000_0000n)
    if (result !== 256n) { throw result }
  }

  {
    const result = height(1n)(1n)
    if (result !== 256n) { throw result }
  }

  {
    const result = height(0n)(0x1_0000_0000_0000_0000_0000_0000_0000_01can)
    if (result !== 127n) { throw result }
  }

  {
    const result = height(0n)(0x1ca_0000_0000_0000_0000_0000_0000_0000_0001n)
    if (result !== 119n) { throw result }
  }

  {
    const result = height(0x7_0000_0000_0000_0000_0000_0000_0000_0000n)(0x4_0000_0000_0000_0000_0000_0000_0000_01can)
    if (result !== 126n) { throw result }
  }

  {
    const result = height(0n)(0x8000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_0000_01can)
    if (result !== 0n) { throw result }
  }

  {
    let a = byteToDigest(0b01)
    let b = byteToDigest(0b10)
    let c = byteToDigest(0b11)
    {
      /** @type {State} */
      let state = []
      push(state)(a)
      if (state.length !== 1) { throw state.length }
      const state0 = state[0]
      if (state0[0] !== a) { throw state0[0] }
      if (state0[1] !== a) { throw state0[1] }
      if (state0[2] !== 0n) { throw state0[2] }
      const ab = push(state)(b)
      const mergeAB = merge(a)(b)
      if (ab !== mergeAB) { throw ab }
      state = state
      if (state.length !== 0) { throw state.length }
    }
    {
      /** @type {State} */
      let state = []
      let result = push(state)(c)
      if (result !== null) { throw result }
      result = push(state)(b)
      if (result !== null) { throw result }
      if (state.length !== 2 ) { throw state.length }
      result = push(state)(a)
      if (result !== null) { throw result }
      if (state.length !== 2 ) { throw state.length }
      result = push(state)(a)
      const mergeCB_AA = merge(merge(c)(b))(merge(a)(a))
      if (result != mergeCB_AA) { throw result }
    }
  }
}