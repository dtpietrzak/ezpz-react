/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs';

export const hmrRuntimePlugin = {
  name: "hmr-runtime",
  setup(build) {
    build.onResolve({ filter: /^hmr:runtime$/ }, (args) => {
      return {
        path: "hmr:runtime",
        namespace: "hmr-runtime",
      }
    })

    build.onLoad({ filter: /.*/, namespace: "hmr-runtime" }, (args) => {
      const contents = fs.readFileSync("ezpz/scripts/hmr-runtime.ts", "utf8")

      return {
        contents: process.env.NODE_ENV === 'production' ?
          '' : contents,
        loader: "ts",
      }
    })
  },
}