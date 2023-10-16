const fs = require('fs')

/** @type {(root: string) => (file: string) => void} */
const get = root => file => {
  try {
    const data = fs.readFileSync(`cdt0/${root}`)
    if (data[0] === 32) {
      const out = data.subarray(1)
      fs.writeFileSync(file, out)
    } else {
      console.error('not implemented')
    }
  } catch (err) {
    console.error(err);
  }
}

get('mnb8j83rgrch8hgb8rbz28d64ec2wranzbzxcy4ebypd8')('out')