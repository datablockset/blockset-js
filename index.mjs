import getModule from './forest/index.mjs'
/** @typedef {import('./cdt/main-tree.mjs').State} StateTree */
/**
 * @template T
 * @typedef {import('./cdt/sub-tree.mjs').Nullable<T>} Nullable
 */
/** @typedef {import('./forest/index.mjs').ForestNodeId} ForestNodeId */
/** @typedef {import('./io/io.mjs').IO} IO */

const { get } = getModule

/** @type {(forestNodeId: ForestNodeId) => string} */
const getPath = ([forestNodeId, isRoot]) => {
  const dir = isRoot ? 'roots' : 'parts'
  return `cdt0/${dir}/${forestNodeId.substring(0, 2)}/${forestNodeId.substring(2, 4)}/${forestNodeId.substring(4)}`
}

/** @type {(hostName: string) => (io: IO) => (forestNodeId: ForestNodeId) => Promise<Uint8Array>} */
const fetchRead = hostName => ({ fetch }) => forestNodeId => fetch(`https://${hostName}/${getPath(forestNodeId)}`)
    .then(async (resp) => resp.arrayBuffer().then(buffer => new Uint8Array(buffer)))

/** @type {(io: IO) => (root: [string, string]) => Promise<number>} */
const getLocal = io => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  await io.write(tempFile, new Uint8Array())
  /** @type {(forestNodeId: ForestNodeId) => Promise<Uint8Array>} */
  const read = forestNodeId => io.read(getPath(forestNodeId))
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
  /** @type {(forestNodeId: ForestNodeId) => Promise<Uint8Array>} */
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