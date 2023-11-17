/** @typedef {import('./io.mjs').IO} IO */

const notImplemented = () => { throw 'not implemented' }

/**
 * @typedef {{[index: string]: Uint8Array}} FileSystem
 */

/** @type {(fs: FileSystem) => (path: string) => Promise<Uint8Array>} */
const read = fs => async (path) => {
  const buffer = fs[path]
  if (buffer === undefined) {
    throw 'file not found'
  }
  return buffer
}

/** @type {(fs: FileSystem) => (path: string, buffer: Uint8Array) => Promise<void>} */
const append = fs => async (path, buffer) => {
  const cur = fs[path]
  if (buffer === undefined) {
    throw 'file not found'
  }
  fs[path] = new Uint8Array([...cur, ...buffer])
}

/** @type {(fs: FileSystem) => (path: string, buffer: Uint8Array) => Promise<void>} */
const write = fs => async (path, buffer) => {
  fs[path] = buffer
}

/** @type {(fs: FileSystem) => (oldPath: string, newPath: string) => Promise<void>} */
const rename = fs => async (oldPath, newPath) => {
  const buffer = fs[oldPath]
  if (buffer === undefined) {
    throw 'file not found'
  }
  delete fs[oldPath]
  fs[newPath] = buffer
}

/** @type {(fs: FileSystem) => IO} */
const virtual = fs => {
  return {
    read: read(fs),
    append: append(fs),
    write: write(fs),
    rename: rename(fs),
    fetch: notImplemented,
    consoleLog: () => {},
    document: undefined
  }
}

export default {
  virtual
}