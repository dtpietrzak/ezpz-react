import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./ezpz/client-script.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['safari11'],
  outfile: 'bundle/bundle.js',
})