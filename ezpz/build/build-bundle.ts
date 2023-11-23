import * as esbuild from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin'
import { hmrRuntimePlugin } from './plugins/hmr-runtime-plugin'
import { hmrPlugin } from './plugins/hmr-plugin'

let init = false

const esbuildConfig = {
  entryPoints: {
    bundle: 'ezpz/scripts/client-script.tsx',
    hmr: "ezpz/scripts/hmr-entrypoint.ts",
    react: "react",
    "react-dom": "react-dom",
    "react-refresh/runtime": "react-refresh/runtime",
  },
  outdir: 'bundle',

  entryNames: "[name]-[hash]",
  assetNames: "[name]-[hash]",
  chunkNames: "[name]-[hash]",

  bundle: true,
  // splitting: true,
  minify: true,
  sourcemap: true,
  metafile: true,

  format: "esm" as esbuild.Format,
  logLevel: "warning" as esbuild.LogLevel,
  jsx: "automatic" as "automatic",

  target: "esnext",
  platform: "browser" as esbuild.Platform,
  supported: {
    "import-meta": true,
  },

  define: {
    "process.env.NODE_ENV": '"development"',
  },

  plugins: [
    CssModulesPlugin({
      // @see https://github.com/indooorsman/esbuild-css-modules-plugin/blob/main/index.d.ts for more details
      force: true,
      emitDeclarationFile: true,
      localsConvention: 'camelCaseOnly',
      namedExports: true,
      inject: false,
    }),
    hmrRuntimePlugin,
    hmrPlugin,
  ],
}

export let esbuildContext: esbuild.BuildContext<typeof esbuildConfig>

export const setupEsBuild = async () => {
  if (!init) {
    init = true
    esbuildContext = await esbuild.context(esbuildConfig)
  }
}

setupEsBuild()

export const buildBundle = async () => {
  console.time('build-bundle')

  if (!esbuildContext) throw new Error("esbuildContext is undefined")
  let buildResult = await esbuildContext.rebuild()

  console.timeEnd('build-bundle')
  return buildResult
}

export const getBundlePaths = (
  build: esbuild.BuildResult,
): {
  js: string[]
  css: string
} => {
  if (!build?.metafile)
    throw new Error("esbuildContext.metafile is undefined")

  let [entry] = Object.entries(build.metafile.outputs).find(
    ([_, output]) => output.inputs["ezpz/scripts/client-script.tsx"]
  ) as any
  let [hmrEntry] = Object.entries(build.metafile.outputs).find(
    ([_, output]) => output.inputs["ezpz/scripts/hmr-entrypoint.ts"]
  ) as any
  const css = Object.entries(build.metafile.outputs)
    .filter((x) => x[0].endsWith(".css"))[0][0]

  entry = JSON.stringify("/" + entry)
  hmrEntry = JSON.stringify("/" + hmrEntry)

  return {
    js: [entry, hmrEntry],
    css: `/${css}`,
  }
}

export default buildBundle