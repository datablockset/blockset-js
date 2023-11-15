import nodeId from './cdt/node-id.mjs'
import forest from './forest/index.mjs'
import getModule from './forest/index.mjs'
/** @typedef {import('./cdt/main-tree.mjs').State} StateTree */
/**
 * @template T
 * @typedef {import('./cdt/sub-tree.mjs').Nullable<T>} Nullable
 */
/** @typedef {import('./forest/index.mjs').ForestNodeId} ForestNodeId */
/** @typedef {import('./forest/index.mjs').ForestGet} ForestGet */
/** @typedef {import('./io/io.mjs').IO} IO */

/** @typedef {{[index: string] : Uint8Array | undefined}} Cache */

const { get } = getModule

/** @type {(forestNodeId: ForestNodeId) => string} */
const getPath = ([forestNodeId, isRoot]) => {
  const dir = isRoot ? 'roots' : 'parts'
  return `cdt0/${dir}/${forestNodeId.substring(0, 2)}/${forestNodeId.substring(2, 4)}/${forestNodeId.substring(4)}`
}

/** @type {(hostName: string) => (io: IO) => (forestNodeId: ForestNodeId) => Promise<Uint8Array>} */
const fetchRead = hostName => ({ fetch }) => forestNodeId => fetch(`https://${hostName}/${getPath(forestNodeId)}`)
  .then(async (resp) => resp.arrayBuffer().then(buffer => new Uint8Array(buffer)))

/** @type {(mem: Cache) => (forestGet: ForestGet) => ForestGet} */
const cache = mem => forestGet => {
  return async (nodeId) => {
    const nodeIdString = `${nodeId[0]}${nodeId[1]}`
    let buffer = mem[nodeIdString]
    if (buffer !== undefined) {
      console.log(`found ${nodeIdString}`)
      return buffer
    }
    buffer = await forestGet(nodeId)
    mem[nodeIdString] = buffer
    return buffer
  }
}

/** @type {(mem: Cache) => (io: IO) => (root: [string, string]) => Promise<number>} */
const getLocal = mem => io => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  await io.write(tempFile, new Uint8Array())
  /** @type {ForestGet} */
  const read = cache(mem)(forestNodeId => io.read(getPath(forestNodeId)))
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

/** @type {(mem: Cache) => (host: string) => (io: IO) => (root: [string, string]) => Promise<number>} */
const getRemote = mem => host => io => async ([root, file]) => {
  const tempFile = `_temp_${root}`
  await io.write(tempFile, new Uint8Array())
  /** @type {ForestGet} */
  const read = cache(mem)(fetchRead(host)(io))
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