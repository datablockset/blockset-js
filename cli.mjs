#!/usr/bin/env node

import index from './index.mjs'
import ioNode from './io/node.mjs'
const { getLocal, getRemote } = index
const { node } = ioNode

var args = process.argv.slice(2)

if (args.length < 2) {
  console.log("Warning: Requires 2 or more arguments");
  console.log("npx blockset-js <address> <outputFile> [hostName]");
  process.exit();
}

const hostName = args[2]
const getFunc = hostName === undefined ? getLocal : getRemote(hostName)
getFunc(node)([args[0], args[1]])