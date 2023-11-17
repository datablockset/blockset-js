import forest from './forest/index.mjs'
import ioWeb from './io/web.mjs'
import index from './index.mjs'
/** @typedef {import('./forest/index.mjs').ForestNodeId} ForestNodeId */
const { get } = forest
const { web } = ioWeb
const { fetchRead } = index

const webIo = web(d => text => {
  // @ts-ignore
  d.getElementById('log').innerText += `${text}\n`
})
const d = webIo.document
// @ts-ignore
d.getElementById('download').addEventListener('click', () => {
  reset()
  // @ts-ignore
  const hash = d.getElementById('input-hash').value
  // @ts-ignore
  const host = d.getElementById('input-host').value
  let buffer = new Uint8Array()
  const fRead = fetchRead(host)(webIo)
  /** @type {(forestNodeId: ForestNodeId) => Promise<Uint8Array>} */
  const read = forestNodeId => {
    webIo.consoleLog(`read from ${forestNodeId}\n`)
    return fRead(forestNodeId)
  }
  /** @type {(b: Uint8Array) => Promise<void>} */
  const write = async (b) => {
    webIo.consoleLog(`write ${b.length}\n`)
    buffer = new Uint8Array([...buffer, ...b])
  }
  get({ read, write })(hash).then(exitCode => {
    if (exitCode !== null) {
      webIo.consoleLog(`error exit code = ${exitCode}\n`)
      return
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      const image = new Blob([buffer], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(image);
      // @ts-ignore
      d.getElementById('output-image').style.display = 'block'
      // @ts-ignore
      d.getElementById('output-image').src = imageUrl;
      return
    }

    // @ts-ignore
    d.getElementById('output-text').style.display = 'block'
    // @ts-ignore
    d.getElementById('output-text').innerText = new TextDecoder().decode(buffer)
  })
});

const reset = () => {
  // @ts-ignore
  d.getElementById('output-image').style.display = 'none'
  // @ts-ignore
  d.getElementById('output-text').style.display = 'none'
}