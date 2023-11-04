import index from './index.mjs'
const { getAsync } = index

var args = process.argv.slice(2)
console.log(`args = ${args}`);

if (args.length !== 2) {
  console.log("Warning: Requires 2 arguments");
  console.log("node cli.mjs [address] [outputFile]");
  process.exit();
}

getAsync([args[0], args[1]])