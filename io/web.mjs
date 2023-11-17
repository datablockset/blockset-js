/** @typedef {import('./io.mjs').IO} IO */
/** @typedef {import('./io.mjs').Console} Console */

const notImplemented = () => { throw 'not implemented' }

/** @type {(createConsole: (d: Document) => Console) => IO} */
const web = createConsole => {
  return {
    read: notImplemented,
    append: notImplemented,
    write: notImplemented,
    rename: notImplemented,
    console: createConsole(document),
    fetch,
    document
  }
}

export default {
  web
}