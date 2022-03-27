// monorepo
import { execa } from 'execa'

const TARGET = process.argv.pop()

async function builder(target) {
  await execa('rollup', [ '-cw', '--environment', `TARGET:${target}` ], { stdio: 'inherit' })
}

builder(TARGET)