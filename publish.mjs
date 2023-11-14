import fs from 'node:fs'
import childProcess from 'node:child_process'
import { promisify } from 'node:util'

const exec2 = promisify(childProcess.exec)

/** @type {(cmd: string) => Promise<void>} */
const exec = async(cmd) => {
  await exec2(cmd).then(({stdout, stderr}) => {
    console.log(`exec ${cmd}`)

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`stdout:\n${stdout}`);
  }).catch(reason => console.error(`error: ${reason.message}`))
}

const publish = async () => {
  const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version
  console.log(`publishing version ${version}`)
  await exec('npm publish')
  await exec(`git tag -a v${version} -m 'v${version}'`)
  await exec('git push origin --tags')
}

publish()