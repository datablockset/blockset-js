import getModule from './get.mjs'
/** @typedef {import('./tree.mjs').State} StateTree */
/**
 * @template T
 * @typedef {import('./subtree.mjs').Nullable<T>} Nullable
 */
/** @typedef {import('./get.mjs').Address} Address */
/** @typedef {import('./io/io.mjs').IO} IO */

const { get } = getModule

/** @type {(address: Address) => string} */
const getPath = ([address, isRoot]) => {
  const dir = isRoot ? 'roots' : 'parts'
  return `cdt0/${dir}/${address.substring(0, 2)}/${address.substring(2, 4)}/${address.substring(4)}`
}

/** @type {(hostName: string) => (io: IO) => (address: Address) => Promise<Uint8Array>} */
const fetchRead = hostName => ({ fetch }) => address => fetch(`https://${hostName}/${getPath(address)}`)
    .then(async (resp) => resp.arrayBuffer().then(buffer => new Uint8Array(buffer)))

/** @type {(io: IO) => (root: [string, string]) => Promise<number>} */
const getLocal = io => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  await io.write(tempFile, new Uint8Array())
  /** @type {(address: Address) => Promise<Uint8Array>} */
  const read = address => io.read(getPath(address))
  /** @type {(buffer: Uint8Array) => Promise<void>} */
  const write = buffer => io.append(tempFile, buffer)
  const error = await get({ read, write })(root)
  if (error !== null) {
    console.error(error)
    return -1
  }
  await io.rename(tempFile, file)
  return 0
}

/** @type {(host: string) => (io: IO) => (root: [string, string]) => Promise<number>} */
const getRemote = host => io => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  await io.write(tempFile, new Uint8Array())
  /** @type {(address: Address) => Promise<Uint8Array>} */
  const read = fetchRead(host)(io)
  /** @type {(buffer: Uint8Array) => Promise<void>} */
  const write = buffer => io.append(tempFile, buffer)
  const error = await get({ read, write })(root)
  if (error !== null) {
    console.error(error)
    return -1
  }
  await io.rename(tempFile, file)
  return 0
}

export default {
  getLocal,
  getRemote,
  fetchRead
}