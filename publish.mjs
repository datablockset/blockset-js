import fs from 'node:fs'
import childProcess from 'node:child_process'
import { promisify } from 'node:util'

const execPromise = promisify(childProcess.exec)

/** @type {(cmd: string) => Promise<void>} */
const exec = async(cmd) => {
  console.log(`exec ${cmd}`)
  try {
    const { stdout, stderr } = await execPromise(cmd)
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout:\n${stdout}`);
  } catch (error) {
    console.error(error)
  }
}

const publish = async () => {
  const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version
  console.log(`publishing version ${version}`)
  await exec('npm publish')
  await exec(`git tag -a v${version} -m 'v${version}'`)
  await exec('git push origin --tags')
}

publish()