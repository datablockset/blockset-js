import getModule from './get.mjs'
/** @typedef {import('./get.mjs').Address} Address */
const { get, fetchRead } = getModule

// @ts-ignore
document.getElementById('download').addEventListener('click', () => {
  reset()
  // @ts-ignore
  const hash = document.getElementById('input-hash').value
  // @ts-ignore
  const host = document.getElementById('input-host').value
  let buffer = new Uint8Array()
  const fRead = fetchRead(host)
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
    if (exitCode === null) {
      // @ts-ignore
      document.getElementById('log').innerText += `error exit code = ${exitCode}`
      return
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      const image = new Blob([buffer], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(image);
      // @ts-ignore
      document.getElementById('output-image').style.visibility = 'visible'
      // @ts-ignore
      document.getElementById('output-image').src = imageUrl;
      return
    }

    // @ts-ignore
    document.getElementById('output-text').innerText =  new TextDecoder().decode(buffer)
  })
});

const reset = () => {
  // @ts-ignore
  document.getElementById('output-image').style.visibility = 'hidden'
  // @ts-ignore
  document.getElementById('output-text').innerText = ''
}