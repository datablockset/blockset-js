/**
 * @typedef {{
* readonly read: (path: string) => Promise<Uint8Array>,
* readonly append: (path: string, buffer: Uint8Array) => Promise<void>,
* readonly write: (path: string, buffer: Uint8Array) => Promise<void>,
* readonly rename: (oldPath: string, newPath: string) => Promise<void>
* readonly fetch: (url: string) => Promise<Response>
* readonly consoleLog: Logger
* readonly document: Document | undefined
* }} IO
*/

/** @typedef {(log: string) => void} Logger */

export default {
}