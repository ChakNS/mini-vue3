import ts from 'rollup-plugin-typescript2'
import resolvePlugin from '@rollup/plugin-node-resolve'
import path from 'path'

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const resolve = p => path.resolve(packageDir, p)

const pkg = require(resolve('package.json'))
const pkgOptions = pkg.buildOptions
const pkgName = path.basename(packageDir)

const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${pkgName}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${pkgName}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${pkgName}.global.js`),
    format: 'iife'
  }
}

function createConfig(output) {
  output.name = pkgOptions.name
  output.sourcemap = true
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin()
    ]
  }
}

// export default pkgOptions.formats?.map(format => createConfig(outputConfig[format]))
export default createConfig(outputConfig['global'])