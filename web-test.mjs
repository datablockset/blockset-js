import getModule from './get.mjs'
/** @typedef {import('./get.mjs').Address} Address */
const { get, fetchRead } = getModule

// @ts-ignore
document.getElementById('download').addEventListener('click', () => {
  // @ts-ignore
  const hash = document.getElementById('input').value
  let buffer = new Uint8Array()
  const fRead = fetchRead('410f5a49.blockset-js-test.pages.dev')
  /** @type {(address: Address) => Promise<Uint8Array>} */
  const read = address => {
    // @ts-ignore
    document.getElementById('log').innerText += `read from ${address}\n`
    return fRead(address)
  }
  /** @type {(b: Uint8Array) => Promise<void>} */
  const write = async (b) => {
    // @ts-ignore
    document.getElementById('log').innerText += `write ${b.length}\n`
      buffer = new Uint8Array([...buffer, ...b])
  }
  get({ read, write })(hash).then(exitCode => {
    const innerText = exitCode === null ? new TextDecoder().decode(buffer) : `error exit code = ${exitCode}`
    // @ts-ignore
    document.getElementById('output').innerText = innerText
  })
});