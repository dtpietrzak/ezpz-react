process.env.NODE_ENV = 'development'
process.env.isServer = 'true'

import { prepServer, startServer, stopServer } from './server'
import { build, rebuild, esbuildContext, } from "./build"
import expressWebSocket from 'express-ws'


import chokidar from 'chokidar'
import { updateRoutesWithNewBuild } from './server/helpers'
import express from 'express'
import { port } from 'src/server'

const isCachingBuilds = false

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
let buildResult: UnwrapPromise<ReturnType<typeof build>>

export const app_for_ws = express()
export const ws = expressWebSocket(app_for_ws)
export const ws_app = ws.app
ws_app.ws("/__hmr__", (ws, req) => {
  console.log('server to client connection established')
})
app_for_ws?.listen(port+1, () => {
  console.log('ws server listening on port 3001')
})

const initServer = async () => {
  console.time('dev-build-time')
  buildResult = await build(isCachingBuilds)
  console.timeEnd('dev-build-time')
  await prepServer()
  await updateRoutesWithNewBuild(buildResult)
  await startServer()
}

export const watcher = chokidar.watch('src/', {
  ignoreInitial: true,
}).on('all', async (eventName, path, stats) => {
  console.log(`\n${eventName} ${path}`)
  try {
    console.time('dev-build-time')
    let newResult = await rebuild(isCachingBuilds)

    let message = JSON.stringify({
      type: "reload",
    })

    if (buildResult && !buildResult.errors.length && buildResult.metafile) {
      const lastInputsSet = new Set(
        Object.keys(buildResult.metafile.inputs)
      )
      const lastInputToOutput = Object.entries(
        buildResult.metafile.outputs
      ).reduce((acc, [outputFile, output]) => {
        Object.keys(output.inputs).forEach((input) => {
          if (lastInputsSet.has(input)) {
            acc[input] = outputFile
          }
        })
        return acc
      }, {})
      if (!newResult.metafile) throw new Error('no metafile in new build result')
      const newInputsSet = new Set(Object.keys(newResult.metafile.inputs))
      const newInputToOutput = Object.entries(
        newResult.metafile.outputs
      ).reduce((acc, [outputFile, output]) => {
        Object.keys(output.inputs).forEach((input) => {
          if (newInputsSet.has(input)) {
            acc[input] = outputFile
          }
        })
        return acc
      }, {})

      const updates = Object.keys(newResult.metafile.inputs).reduce(
        (acc: any, input) => {
          if (lastInputToOutput[input] !== newInputToOutput[input]) {
            acc.push({
              type: "update",
              id: input,
              url: "/" + newInputToOutput[input].replace(/^public\//, ""),
            })
          }

          return acc
        },
        []
      )

      message = JSON.stringify({ type: "hmr", updates });
    }

    buildResult = newResult

    await stopServer()
    await prepServer()
    await updateRoutesWithNewBuild(buildResult)
    await startServer()

    console.timeEnd('dev-build-time')

    const clients = ws.getWss().clients;
    if (clients.size > 0) {
      console.log(
        "Send reload to",
        clients.size,
        "client" + (clients.size > 1 ? "s" : "")
      )
      clients.forEach((socket) => {
        socket.send(message)
      })
    }

  } catch (err) {
    console.error('error building / restarting the server\n', err)
  }
})

initServer()

await new Promise((resolve) => process.once("SIGINT", resolve));

try {
  console.log('closing watcher')
  await watcher.close();
} catch { }
try {
  console.log('disposing esbuild context')
  await esbuildContext.dispose()
} catch { }
try {
  console.log('stopping server')
  await stopServer()
} catch { }



