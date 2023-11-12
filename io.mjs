import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
/** @typedef {import('./get.mjs').Address} Address */

/** @type {(address: Address) => string} */
const getPath = ([address, isRoot]) => {
  const dir = isRoot ? 'roots' : 'parts'
  return `cdt0/${dir}/${address.substring(0, 2)}/${address.substring(2, 4)}/${address.substring(4)}`
}

/** @type {(path: string) => Promise<void>} */
const createFile = path => fsPromises.writeFile(path, new Uint8Array())

/** @type {(path: string) => Promise<Uint8Array>} */
const readFile = path => fsPromises.readFile(path)

/** @type {(path: string) => Promise<Uint8Array>} */
const readFileSync = path =>  Promise.resolve(fs.readFileSync(path))

/** @type {(path: string) => (buffer: Uint8Array) => Promise<void>} */
const appendFile = path => buffer => fsPromises.appendFile(path, buffer)

/** @type {(path: string) => (buffer: Uint8Array) => Promise<void>} */
const appendFileSync = path => buffer => Promise.resolve(fs.appendFileSync(path, buffer))

/** @type {(oldPath: string) => (newPath: string) => Promise<void>} */
const renameFile = oldPath => newPath => fsPromises.rename(oldPath, newPath)

/** @type {(hostName: string) => (address: Address) => Promise<Uint8Array>} */
const fetchRead = hostName => address => fetch(`https://${hostName}/${getPath(address)}`)
    .then(async (resp) => resp.arrayBuffer().then(buffer => new Uint8Array(buffer)))

export default {
  getPath,
  createFile,
  readFile,
  readFileSync,
  appendFile,
  appendFileSync,
  renameFile,
  fetchRead
}