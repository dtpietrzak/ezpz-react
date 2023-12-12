process.env.NODE_ENV = 'production'
process.env.isServer = 'true'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react'
import { prepServer, startServer, stopServer } from './server'
import { build, esbuildContext, } from "./build"

import { updateRoutesWithNewBuild } from './server/helpers'
import { addRelativeToFetch } from './tools/node-wrappers'

addRelativeToFetch()
const isCachingBuilds = false

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
let buildResult: UnwrapPromise<ReturnType<typeof build>>

const initServer = async () => {
  console.time('dev-build-time')
  buildResult = await build(isCachingBuilds)
  console.timeEnd('dev-build-time')
  await prepServer()
  await updateRoutesWithNewBuild(buildResult)
  await startServer()
}

initServer()

await new Promise((resolve) => process.once("SIGINT", resolve));

try {
  console.log('disposing esbuild context')
  await esbuildContext.dispose()
} catch (err) { console.log(err) }
try {
  console.log('stopping server')
  await stopServer()
} catch (err) { console.log(err) }



