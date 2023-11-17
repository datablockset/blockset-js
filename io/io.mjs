/**
 * @typedef {{
* readonly read: (path: string) => Promise<Uint8Array>,
* readonly append: (path: string, buffer: Uint8Array) => Promise<void>,
* readonly write: (path: string, buffer: Uint8Array) => Promise<void>,
* readonly rename: (oldPath: string, newPath: string) => Promise<void>
* readonly fetch: (url: string) => Promise<Response>
* readonly consoleLog: (log: string) => void
* readonly document: Document | undefined
* }} IO
*/

export default {
}