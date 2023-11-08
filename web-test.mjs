import getModule from './get.mjs'
const { get, fetchRead } = getModule

// @ts-ignore
document.getElementById('download').addEventListener('click', () => {
  // @ts-ignore
  const hash = document.getElementById('input').value
  let buffer = new Uint8Array()
  const read = fetchRead('410f5a49.blockset-js-test.pages.dev')
  /** @type {(b: Uint8Array) => Promise<void>} */
  const write = async(b) => { buffer = new Uint8Array([...buffer, ...b]) }
  get({read, write})(hash).then(exitCode => {
    const innerText = exitCode === null ? new TextDecoder().decode(buffer) : `error exit code = ${exitCode}`
     // @ts-ignore
     document.getElementById('output')?.innerText = innerText
  })
});