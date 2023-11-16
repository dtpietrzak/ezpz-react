import * as esbuild from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin';

await esbuild.build({
  entryPoints: ['./ezpz/scripts/client-script.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['safari11'],
  outfile: 'bundle/bundle.js',
  plugins: [CssModulesPlugin({
    // @see https://github.com/indooorsman/esbuild-css-modules-plugin/blob/main/index.d.ts for more details
    force: true,
    emitDeclarationFile: true,
    localsConvention: 'camelCaseOnly',
    namedExports: true,
    inject: false
  })],
})