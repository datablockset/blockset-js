import { writeFile } from 'fs'
import getModule from './get.mjs'
import ioModule from './io.mjs'
/** @typedef {import('./tree.mjs').State} StateTree */
/**
 * @template T
 * @typedef {import('./subtree.mjs').Nullable<T>} Nullable
 */
/** @typedef {import('./get.mjs').Address} Address */
const { get } = getModule
const { getPath, createFile, readFile, readFileSync, appendFile, appendFileSync, renameFile, fetchRead } = ioModule

/**
 * @typedef {{
 * readonly read: (address: Address) => Promise<Uint8Array>,
 * readonly write: (path: string) => (buffer: Uint8Array) => Promise<void>,
 * }} Provider
*/

/** @type {(hostName: string) => Provider} */
const fetchProvider = hostName => ({
  read: fetchRead(hostName),
  write: path => buffer => appendFile(path)(buffer)
})

/** @type {Provider} */
const asyncFileProvider = {
  read: address => readFile(getPath(address)),
  write: path => buffer => appendFile(path)(buffer)
}

/** @type {Provider} */
const syncFileProvider = {
  read: address => Promise.resolve(readFileSync(getPath(address))),
  write: path => buffer => Promise.resolve(appendFileSync(path)(buffer))
}

/** @type {(provider: Provider) => (root: [string, string]) => Promise<number>} */
const getLocal = ({ read, write }) => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  await createFile(tempFile)
  /** @type {(buffer: Uint8Array) => Promise<void>} */
  const write = buffer => appendFile(tempFile)(buffer)
  const error = await get({ read, write })(root)
  if (error !== null) {
    console.error(error)
    return -1
  }
  await renameFile(tempFile)(file)
  return 0
}

export default {
  get: getLocal,
  syncFileProvider,
  asyncFileProvider,
  fetchProvider
}