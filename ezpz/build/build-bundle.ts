import * as esbuild from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin'
import { hmrRuntimePlugin } from './plugins/hmr-runtime-plugin'
import { hmrPlugin } from './plugins/hmr-plugin'
import { babelPlugin } from './plugins/babel'

const env = process.env.NODE_ENV || "development"

let init = false

// isolate everything before the routes from the rest of the app

const entryPoints = process.env.NODE_ENV === 'production' ?
  {
    bundle: 'ezpz/scripts/client-script.tsx',
    root: 'ezpz/tools/components/ProvidersForClient.tsx',
    app: 'build/app.tsx',
    css: 'build/app.css',
    layouts_tool: 'ezpz/tools/components/Layouts.tsx',
    layouts: 'build/layouts/layouts_for_csr.tsx',
    routes: 'build/routing/routes_for_csr.tsx',
    ezpz: "ezpz",
    react: "react",
    "react-dom": "react-dom",
  } :
  {
    bundle: 'ezpz/scripts/client-script.tsx',
    root: 'ezpz/tools/components/ProvidersForClient.tsx',
    app: 'build/app.tsx',
    css: 'build/app.css',
    layouts_tool: 'ezpz/tools/components/Layouts.tsx',
    layouts: 'build/layouts/layouts_for_csr.tsx',
    routes: 'build/routing/routes_for_csr.tsx',
    hmr: "ezpz/scripts/hmr-entrypoint.ts",
    ezpz: "ezpz",
    react: "react",
    "react-dom": "react-dom",
    "react-refresh/runtime": "react-refresh/runtime",
  } as Record<string, string>

const esbuildConfig = {
  entryPoints: entryPoints,

  outdir: 'bundle',

  entryNames: "[name]-[hash]",
  assetNames: "[name]-[hash]",
  chunkNames: "[name]-[hash]",

  bundle: true,
  splitting: true,
  minify: process.env.NODE_ENV === 'production' ? true : false,
  sourcemap: true,
  metafile: true,

  format: "esm" as esbuild.Format,
  logLevel: "warning" as esbuild.LogLevel,
  jsx: "automatic" as const,

  target: "esnext",
  platform: "browser" as esbuild.Platform,
  supported: {
    "import-meta": true,
  },

  define: {
    "process.env.NODE_ENV":
      env === 'production' ? '"production"' : '"development"',
  },

  plugins: process.env.NODE_ENV === 'production' ?
    [
      babelPlugin,
      CssModulesPlugin({
        // @see https://github.com/indooorsman/esbuild-css-modules-plugin/blob/main/index.d.ts for more details
        force: true,
        emitDeclarationFile: true,
        localsConvention: 'camelCaseOnly',
        namedExports: true,
        inject: false,
      }),
    ] :
    [
      babelPlugin,
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
} satisfies esbuild.BuildOptions

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
  const buildResult = await esbuildContext.rebuild()

  console.timeEnd('build-bundle')
  return buildResult
}

export const getBundlePaths = (
  build: esbuild.BuildResult,
): {
  js: (string | undefined)[]
  css: string
} => {
  if (!build?.metafile)
    throw new Error("esbuildContext.metafile is undefined")

  let hmr: string | undefined

  const entry = JSON.stringify("/" + Object.entries(build.metafile.outputs).find(
    ([_, output]) => output.inputs["ezpz/scripts/client-script.tsx"]
  )?.[0])
  const css = Object.entries(build.metafile.outputs)
    .filter((x) => x[0].endsWith(".css"))?.[0]?.[0]

  if (process.env.NODE_ENV === 'development') {
    hmr = JSON.stringify("/" + Object.entries(build.metafile.outputs).find(
      ([_, output]) => output.inputs["ezpz/scripts/hmr-entrypoint.ts"]
    )?.[0])
  }

  return {
    js: [entry, hmr],
    css: css && `/${css}`,
  }
}

export default buildBundle