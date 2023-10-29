import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./bundle/client-script.jsx'],
  bundle: true,
  minify: false,
  sourcemap: true,
  target: ['safari11'],
  outfile: 'bundle/bundle.js',
})