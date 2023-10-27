/** @type {(a: bigint[]) => bigint} */
const u128x4toU512 = ([a0, a1, a2, a3]) => a0 | (a1 << 128n) | (a2 << 256n) | (a3 << 384n)

const k = [
  u128x4toU512([
    0xe9b5dba5_b5c0fbcf_71374491_428a2f98n,
    0xab1c5ed5_923f82a4_59f111f1_3956c25bn,
    0x550c7dc3_243185be_12835b01_d807aa98n,
    0xc19bf174_9bdc06a7_80deb1fe_72be5d74n,
  ]),
  u128x4toU512([
    0x240ca1cc_0fc19dc6_efbe4786_e49b69c1n,
    0x76f988da_5cb0a9dc_4a7484aa_2de92c6fn,
    0xbf597fc7_b00327c8_a831c66d_983e5152n,
    0x14292967_06ca6351_d5a79147_c6e00bf3n,
  ]),
  u128x4toU512([
    0x53380d13_4d2c6dfc_2e1b2138_27b70a85n,
    0x92722c85_81c2c92e_766a0abb_650a7354n,
    0xc76c51a3_c24b8b70_a81a664b_a2bfe8a1n,
    0x106aa070_f40e3585_d6990624_d192e819n,
  ]),
  u128x4toU512([
    0x34b0bcb5_2748774c_1e376c08_19a4c116n,
    0x682e6ff3_5b9cca4f_4ed8aa4a_391c0cb3n,
    0x8cc70208_84c87814_78a5636f_748f82een,
    0xc67178f2_bef9a3f7_a4506ceb_90befffan,
  ])
];

const init = 0xbefa4fa4_64f98fa7_68581511_ffc00b31_f70e5939_3070dd17_367cd507_c1059ed8n

/** @type {(d: number) => (n: number) => number} */
const rotr = d => {
  const r = 32 - d
  return n => n >>> d | n << r
}

/** @type {(x: number) => (y: number) => (z: number) => number} */
const ch = x => y => z => x & y ^ ~x & z

/** @type {(x: number) => (y: number) => (z: number) => number} */
const maj = x => y => z => x & y ^ x & z ^ y & z

/** @type {(d: number) => (n: number) => number} */
const shr = d => n => n >>> d

/** @type {(a: number) => (b: number) => (c: number) => (x: number) => number} */
const bigSigma = a => b => c => {
  const ra = rotr(a)
  const rb = rotr(b)
  const rc = rotr(c)
  return x => ra(x) ^ rb(x) ^ rc(x)
}

const bigSigma0 = bigSigma(2)(13)(22)

const bigSigma1 = bigSigma(6)(11)(25)

/** @type {(a: number) => (b: number) => (c: number) => (x: number) => number} */
const smallSigma = a => b => c => {
  const ra = rotr(a)
  const rb = rotr(b)
  const sc = shr(c)
  return x => ra(x) ^ rb(x) ^ sc(x)
}

const smallSigma0 = smallSigma(7)(18)(3)

const smallSigma1 = smallSigma(17)(19)(10)

const u256Mask = (1n << 256n) - 1n

const u32Mask = (1n << 32n) - 1n

const u32Mask7 = u32Mask << 224n

/** @type {(uint512: bigint) => (index: bigint) => bigint} */
const getU32 = uint512 => index => (uint512 >> (index << 5n)) & u32Mask

/** @type {(uint512: bigint) => (index: bigint) => number} */
const getU32Number = uint512 => index => Number(getU32(uint512)(index))

/** @type {(num: number) => bigint} */
const toBigInt32 = num => {
  num |= 0
  if (num < 0) {
    num += 0x1_0000_0000
  }
  return BigInt(num)
}

/** @type {(uint512: bigint) => (index: bigint) => (num: number) => bigint} */
const setU32 = uint512 => index => num => {
  const uint32 = toBigInt32(num)
  index <<= 5n
  const mask = u32Mask << index
  return (uint512 & ~mask) | (uint32 << index)
}

/** @type {(a: bigint) => (b: bigint) => bigint} */
const u32x8Add = a => b => {
  let result = 0n
  for (let i = 0n; i < 256n; i += 32n) {
    result |= ((a + b) & u32Mask) << i
    a >>= 32n
    b >>= 32n
  }
  return result
}

/** @type {(uint512: bigint) => bigint} */
const compress = w => {
  let x = init
  let i = 0
  const round16 = () => {
    let ki = k[i]
    /** @type {(j: bigint) => void} */
    const round = j => {
      const kij = getU32Number(ki)(j)
      const wj = getU32Number(w)(j)
      const a = getU32Number(x)(0n)
      const d = getU32Number(x)(3n)
      const e = getU32Number(x)(4n)
      const t1 = getU32Number(x)(7n) + bigSigma1(e) + ch(e)(getU32Number(x)(5n))(getU32Number(x)(6n)) + kij + wj
      const t2 = bigSigma0(a) + maj(a)(getU32Number(x)(1n))(getU32Number(x)(2n))
      x <<= 32n
      x &= u256Mask
      x = setU32(x)(4n)(d + t1)
      x = setU32(x)(0n)(t1 + t2)
    }
    for (let j = 0n; j < 16n; j += 1n) {
      round(j)
    }
  }
  const wRound16 = () => {
    for (let j = 0; j < 16; j++) {
      const w0 = smallSigma1(getU32Number(w)(0xen)) + getU32Number(w)(0x9n) + smallSigma0(getU32Number(w)(0x1n)) + getU32Number(w)(0x0n)
      w = (w >> 32n) | (toBigInt32(w0) << 480n)
    }
    i++
  }
  round16()
  wRound16()
  round16()
  wRound16()
  round16()
  wRound16()
  round16()
  x = u32x8Add(x)(init)
  return x | u32Mask7
}

/** @type {(a256: bigint) => (b256: bigint) => bigint} */
const compress2 = a256 => b256 => compress(a256 | (b256 << 256n))

export default {
    compress,
    compress2
}