import fs from 'node:fs'

const pjson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
console.log(pjson.version)