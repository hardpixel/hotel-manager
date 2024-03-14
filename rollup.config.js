import pkg from './package.json'

import extension from 'rollup-plugin-gsext'
import sass from 'rollup-plugin-sass'
import del from 'rollup-plugin-delete'
import zip from 'rollup-plugin-zipdir'

export default {
  input: [
    'src/metadata.json',
    'src/stylesheet.scss'
  ],
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [
    extension({
      useESM: true,
      metadata: {
        version: Number(pkg.version)
      }
    }),
    sass({
      output: 'dist/stylesheet.css'
    }),
    del({
      hook: 'writeBundle',
      targets: [
        'dist/stylesheet.js',
        'build/*.zip'
      ]
    }),
    process.env.package && zip({
      name: `${pkg.name}-v${pkg.version}.zip`,
      outputDir: 'build'
    })
  ]
}
