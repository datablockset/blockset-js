/** @typedef {import('./io.mjs').IO} IO */

const notImplemented = () => { throw 'not implemented' }

/** @type {IO} */
const web = {
  read: notImplemented,
  append: notImplemented,
  write: notImplemented,
  rename: notImplemented,
  consoleLog: () => {},
  fetch,
  document
}

export default {
  web
}