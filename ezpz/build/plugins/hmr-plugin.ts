import fs from 'fs'
import path from 'path'
import * as esbuild from 'esbuild'

export const hmrPlugin = {
  name: "hmr",
  async setup(build) {
    const babel = await import("@babel/core")
    const reactRefresh = await import("react-refresh/babel")

    if (!babel?.transformSync) return

    const IS_FAST_REFRESH_ENABLED = /\$RefreshReg\$\(/

    const appDir = path.join(process.cwd(), "build")

    build.onLoad({ filter: /.*/, namespace: "file" }, (args) => {
      if (process.env.NODE_ENV === 'production') return {
        contents: '',
        loader: args.path.endsWith("x") ? "tsx" : "ts",
      }

      if (
        !args.path.match(/\.[tj]sx?$/) ||
        !fs.existsSync(args.path) ||
        !args.path.startsWith(appDir)
      ) {
        return undefined
      }

      const hmrId = path.relative(process.cwd(), args.path)
      const hmrPrefix = fs
        .readFileSync("ezpz/scripts/hmr-prefix.ts", "utf8")
        .replace(
          `import * as __hmr__ from "./hmr-runtime";`,
          `import * as __hmr__ from "hmr:runtime";`
        )
        .replace(/"\$id\$"/g, `"${hmrId.replace(/ /g, '')}"`)

      const sourceCode = fs.readFileSync(args.path, "utf8")

      const sourceCodeWithHMR = hmrPrefix + sourceCode

      const jsWithHMR = esbuild.transformSync(sourceCodeWithHMR, {
        loader: args.path.endsWith("x") ? "tsx" : "ts",
        format: args.pluginData?.format || "esm",
      }).code
      let resultCode = jsWithHMR

      const jsWithReactRefresh = babel.transformSync(jsWithHMR, {
        filename: args.path,
        ast: false,
        compact: false,
        sourceMaps: build.initialOptions.sourcemap ? "inline" : false,
        configFile: false,
        babelrc: false,
        plugins: [
          [reactRefresh.default, { skipEnvCheck: true }],
        ],
        presets: [
          '@babel/preset-typescript',
          ["@babel/preset-react", { "runtime": "automatic" }],
        ]
      })?.code ?? ''

      if (!jsWithReactRefresh) throw new Error("jsWithReactRefresh is null")

      if (IS_FAST_REFRESH_ENABLED.test(jsWithReactRefresh)) {
        resultCode = `
        var prevRefreshReg = window.$RefreshReg$;
        var prevRefreshSig = window.$RefreshSig$;
        var RefreshRuntime = require('react-refresh/runtime');

        window.$RefreshReg$ = (type, id) => {
          const fullId =  "${hmrId} " + id;
          RefreshRuntime.register(type, fullId);
        }

        window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;

        ${jsWithReactRefresh}

        try {
          
        } finally {
          window.$RefreshReg$ = prevRefreshReg;
          window.$RefreshSig$ = prevRefreshSig;
        }

        import.meta.hot.accept(({ module }) => {
          window.$RefreshRuntime$.performReactRefresh();
        });`
      }

      return {
        contents: resultCode,
        loader: args.path.endsWith("x") ? "tsx" : "ts",
        resolveDir: path.dirname(args.path),
      }
    })
  },
}