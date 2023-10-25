import sha224 from './sha224.mjs'
const { compress } = sha224

const maxLength = 248n

const u32Mask = 0xffff_ffffn

const hashMask = u32Mask << 224n;

const byteMask = 0x08n << maxLength

const dataMask = (1n << 248n) - 1n

// a length of the sequence in bits.
// The function returns 255 if the digest is a hash.
/** @type {(bu256: bigint) => bigint} */
const len = bu256 => (bu256 >> maxLength) & u32Mask

/** @type {(nu8: number) => bigint} */
const byteToDigest = nu8 => BigInt(nu8) | byteMask

/** @type {(bu256: bigint) => bigint} */
const getData = bu256 => bu256 & dataMask

/** @type {(a: bigint) => (b: bigint) => bigint} */
const merge = a => b => {
    const lenA = len(a)
    const lenB = len(b)
    const lenAB = lenA + lenB
    if (lenAB <= maxLength) {
        const data = getData(a) | (getData(b) << lenA);
        return data | (lenAB << maxLength)
    }
    return compress(a | (b << 256n))
}

export default {
    merge,
    byteToDigest,
    len
}