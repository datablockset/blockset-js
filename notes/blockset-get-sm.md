## Blockset Get State Machine

/**
 * @typedef {{
*  readonly status: 'inProgress'
*  readonly adresses: Address[]
* }} StateInProgress
*/

/**
 * @typedef {{
*  readonly status: 'result'
*  readonly value: Buffer
* }} StateResult
*/

/**
 * @typedef {{
*  readonly status: 'error'
*  readonly message: string
* }} StateError
*/

/**
 * @typedef {|
* StateInProgress |
* StateError |
* StateResult
* } BlocksetGetState
*/

/** @type {(root: string) => BlocksetGetState} */
const get = root => { ... }