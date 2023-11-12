import getModule from './get.mjs'
/** @typedef {import('./tree.mjs').State} StateTree */
/**
 * @template T
 * @typedef {import('./subtree.mjs').Nullable<T>} Nullable
 */
/** @typedef {import('./get.mjs').Address} Address */
/** @typedef {import('./io.mjs').Provider} Provider */
const { get } = getModule

/** @type {(provider: Provider) => (root: [string, string]) => Promise<number>} */
const getLocal = ({ read, write, create, rename }) => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  await create(tempFile)
  /** @type {(buffer: Uint8Array) => Promise<void>} */
  const writeTempFile = buffer => write(tempFile)(buffer)
  const error = await get({ read, write: writeTempFile })(root)
  if (error !== null) {
    console.error(error)
    return -1
  }
  await rename(tempFile)(file)
  return 0
}

export default {
  get: getLocal
}