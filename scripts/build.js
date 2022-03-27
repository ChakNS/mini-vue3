// monorepo
import { execa } from 'execa'
import fs from 'fs'

const dirs = fs.readdirSync('packages').filter(d => fs.statSync(`packages/${d}`).isDirectory())

async function builder(target) {
  await execa('rollup', [ '-c', '--environment', `TARGET:${target}` ], { stdio: 'inherit' })
}

function runParallel(modules, iterFn) {
  return Promise.all(modules.map(item => iterFn(item)))
}

runParallel(dirs, builder).then(() => {
  console.log('成功')
})