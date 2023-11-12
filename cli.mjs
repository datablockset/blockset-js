#!/usr/bin/env node

import index from './index.mjs'
import io from './io.mjs'
const { get } = index
const { asyncFileProvider, fetchProvider } = io

var args = process.argv.slice(2)

if (args.length < 2) {
  console.log("Warning: Requires 2 or more arguments");
  console.log("npx blockset-js <address> <outputFile> [hostName]");
  process.exit();
}

const hostName = args[2]
const provider = hostName === undefined ? asyncFileProvider : fetchProvider(hostName)
get(provider)([args[0], args[1]])