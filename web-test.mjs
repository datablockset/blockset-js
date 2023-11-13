import getModule from './get.mjs'
import ioWeb from './io/web.mjs'
import index from './index.mjs'
/** @typedef {import('./get.mjs').Address} Address */
const { get } = getModule
const { web } = ioWeb
const { fetchRead } = index

// @ts-ignore
document.getElementById('download').addEventListener('click', () => {
  reset()
  // @ts-ignore
  const hash = document.getElementById('input-hash').value
  // @ts-ignore
  const host = document.getElementById('input-host').value
  let buffer = new Uint8Array()
  const fRead = fetchRead(host)(web)
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
    if (exitCode !== null) {
      // @ts-ignore
      document.getElementById('log').innerText += `error exit code = ${exitCode}\n`
      return
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      const image = new Blob([buffer], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(image);
      // @ts-ignore
      document.getElementById('output-image').style.display = 'block'
      // @ts-ignore
      document.getElementById('output-image').src = imageUrl;
      return
    }

    // @ts-ignore
    document.getElementById('output-text').style.display = 'block'
    // @ts-ignore
    document.getElementById('output-text').innerText =  new TextDecoder().decode(buffer)
  })
});

const reset = () => {
  // @ts-ignore
  document.getElementById('output-image').style.display = 'none'
  // @ts-ignore
  document.getElementById('output-text').style.display = 'none'
}