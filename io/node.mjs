import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
/** @typedef {import('./io.mjs').IO} IO */

/** @type {IO} */
const node = {
  read: fsPromises.readFile,
  append: fsPromises.appendFile,
  write: fsPromises.writeFile,
  rename: fsPromises.rename,
  console: {log: console.log, error: console.error},
  fetch,
  document: undefined
}

/** @type {IO} */
const nodeSync = {
  read: async(path) => fs.readFileSync(path),
  append: async(path, buffer) => fs.appendFileSync(path, buffer),
  write: async(path, buffer) => fs.writeFileSync(path, buffer),
  rename: async(oldPath, newPath) => fs.renameSync(oldPath, newPath),
  console: {log: console.log, error: console.error},
  fetch,
  document: undefined
}

export default {
  node,
  nodeSync
}