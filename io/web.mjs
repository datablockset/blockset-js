/** @typedef {import('./io.mjs').IO} IO */
/** @typedef {import('./io.mjs').Logger} Logger */

const notImplemented = () => { throw 'not implemented' }

/** @type {(createLogger: (d: Document) => Logger) => IO} */
const web = createLogger => {
  return {
    read: notImplemented,
    append: notImplemented,
    write: notImplemented,
    rename: notImplemented,
    consoleLog: createLogger(document),
    fetch,
    document
  }
}

export default {
  web
}