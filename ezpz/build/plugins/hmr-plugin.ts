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

    const appDir = path.join(process.cwd(), "src")

    build.onLoad({ filter: /.*/, namespace: "file" }, (args) => {
      if (
        !args.path.match(/\.[tj]sx?$/) ||
        !fs.existsSync(args.path) ||
        !args.path.startsWith(appDir)
      ) {
        return undefined
      }

      const hmrId = JSON.stringify(
        path.relative(process.cwd(), args.path)
      )
      const hmrPrefix = fs
        .readFileSync("ezpz/scripts/hmr-prefix.ts", "utf8")
        .replace(
          `import * as __hmr__ from "./hmr-runtime";`,
          `import * as __hmr__ from "hmr:runtime";`
        )
        .replace(/\$id\$/g, hmrId)
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
        resultCode =
          `
        if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
          console.warn('@remix-run/react-refresh: HTML setup script not run. React Fast Refresh only works when Remix serves your HTML routes. You may want to remove this plugin.');
        } else {
          var prevRefreshReg = window.$RefreshReg$;
          var prevRefreshSig = window.$RefreshSig$;
          window.$RefreshReg$ = (type, id) => {
            window.$RefreshRuntime$.register(type, ${JSON.stringify(
            hmrId
          )} + id);
          }
          window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
        }
      ` +
          jsWithReactRefresh +
          `
        window.$RefreshReg$ = prevRefreshReg;
        window.$RefreshSig$ = prevRefreshSig;
        import.meta.hot.accept(({ module }) => {
          window.$RefreshRuntime$.performReactRefresh();
        });
      `
      }

      return {
        contents: resultCode,
        loader: args.path.endsWith("x") ? "tsx" : "ts",
        resolveDir: path.dirname(args.path),
      }
    })
  },
}