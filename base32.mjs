/** @type {(uint5: number) => string} */
const toBase32 = uint5 => '0123456789abcdefghjkmnpqrstvwxyz'[uint5]

/** @type {(uint256: bigint) => number} */
const getParityBit = uint256 => {
    let xor = uint256 ^ (uint256 >> 128n)
    xor ^= xor >> 64n
    xor ^= xor >> 32n
    xor ^= xor >> 16n
    xor ^= xor >> 8n
    xor ^= xor >> 4n
    xor ^= xor >> 2n
    xor ^= xor >> 1n
    return Number(xor & 1n)
}

/** @type {(bu224: bigint) => string} */
const toAddress = bu224 => {
    let address = ''
    const parity = getParityBit(bu224)
    for (let j = 0; j < 45; j++) {
        let uint5 = Number(bu224 & 0b11111n)
        if (j == 44) {
            uint5 += parity << 4
        }
        address += toBase32(uint5)
        bu224 >>= 5n
    }
    return address
}

export default {
    toAddress,
    getParityBit
}