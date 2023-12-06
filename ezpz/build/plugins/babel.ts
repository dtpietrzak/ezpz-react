import fs from 'fs'
import path from 'path'
import * as esbuild from 'esbuild'

export const babelPlugin = {
  name: "babel",
  async setup(build) {
    const babel = await import("@babel/core")

    if (!babel?.transformSync) return

    const appDir = path.join(process.cwd(), "build")

    build.onLoad({ filter: /.*/, namespace: "file" }, (args) => {
      if (
        !args.path.match(/\.[tj]sx?$/) ||
        !fs.existsSync(args.path) ||
        !args.path.startsWith(appDir)
      ) {
        return undefined
      }

      const sourceCode = fs.readFileSync(args.path, "utf8")

      const jsPostEs = esbuild.transformSync(sourceCode, {
        loader: args.path.endsWith("x") ? "tsx" : "ts",
        format: args.pluginData?.format || "esm",
      }).code

      const jsPostBabel = babel.transformSync(jsPostEs, {
        filename: args.path,
        ast: false,
        compact: false,
        sourceMaps: build.initialOptions.sourcemap ? "inline" : false,
        configFile: false,
        babelrc: false,
        presets: [
          '@babel/preset-typescript',
          ["@babel/preset-react", { "runtime": "automatic" }],
        ]
      })?.code ?? ''

      if (!jsPostBabel) throw new Error("jsWithReactRefresh is null")

      const jsWithReact = `import * as React from 'react';\n${jsPostBabel}`

      return {
        contents: jsWithReact,
        loader: args.path.endsWith("x") ? "tsx" : "ts",
        resolveDir: path.dirname(args.path),
      }
    })
  },
}