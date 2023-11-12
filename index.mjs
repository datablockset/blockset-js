import getModule from './get.mjs'
import ioModule from './io.mjs'
/** @typedef {import('./tree.mjs').State} StateTree */
/**
 * @template T
 * @typedef {import('./subtree.mjs').Nullable<T>} Nullable
 */
/** @typedef {import('./get.mjs').Address} Address */
/** @typedef {import('./io.mjs').Provider} Provider */
const { get } = getModule
const { createFile, renameFile } = ioModule

/** @type {(provider: Provider) => (root: [string, string]) => Promise<number>} */
const getLocal = ({ read, write }) => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  await createFile(tempFile)
  /** @type {(buffer: Uint8Array) => Promise<void>} */
  const writeTempFile = buffer => write(tempFile)(buffer)
  const error = await get({ read, write: writeTempFile })(root)
  if (error !== null) {
    console.error(error)
    return -1
  }
  await renameFile(tempFile)(file)
  return 0
}

export default {
  get: getLocal
}