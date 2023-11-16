import {
  spawn,
  spawnSync,
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from 'child_process'
import readline from 'readline'

import buildSetup from './scripts/build-setup'
import buildPages from './scripts/build-pages'
import buildRoutes from './scripts/build-routes'
import buildLayouts from './scripts/build-layouts'
import buildRoutes2 from './scripts/build-routes2'
import buildPostcss from './scripts/build-postcss'

console.log('\n')
console.time('dev-build-time')

const npm = async (
  args: string[],
  options?: SpawnOptionsWithoutStdio,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { stdout } = spawn('npm', args, options)
    const id = args.join('')

    stdout.on('data', (data) => {
      if (data.includes('node --loader ts-node/esm')) return
      if (data.includes('node esbuild.mjs')) return
      console.log(data.toString())
    })

    stdout.on('exit', (code) => {
      console.log(`${id} exited${code ? ` with code ${code}` : ''}`)
      resolve()
    })

    stdout.on('error', (err) => {
      console.error(`${id} errored with:

      ${err}
      
      `)
      reject(err)
    })

    stdout.on('close', (code) => {
      if (code) console.log(`${id} closed with code ${code}`)
      resolve()
    })
  })
}

const run = async (nodeScriptName: string): Promise<void> => {
  return npm(['run', nodeScriptName])
}

let serverProcess: ChildProcessWithoutNullStreams

const startServer = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('node', ['--loader', 'ts-node/esm', 'src/server/index.tsx'])

    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString())
      if (data.toString().includes('App loaded')) {
        resolve()
      }
    })

    serverProcess.stdout.on('exit', (code) => {
      console.log(`server process exited${code ? ` with code ${code}` : ''}`)
    })

    serverProcess.stdout.on('error', (err) => {
      console.error(`server process errored with ${err}`)
    })

    serverProcess.stdout.on('close', (code) => {
      console.log(`server process closed${code ? ` with code ${code}` : ''}`)
      spawnSync('./ezpz/scripts/kill-port.sh')
    })
  })
}

let controllerIsExecuting = false

const startController = async () => {
  controllerIsExecuting = false
  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)

  console.log('press control+c to exit')
  console.log(`
  r - reload server
  b - rebuild bundle, etc...
  s - rebuild css/styles, etc...
  l - rebuild layouts, etc...
  u - rebuild routes, etc...
  p - rebuild pages, etc...
  x - restart everything
  `)

  process.stdin.on('keypress', async (str, key) => {
    if (key.ctrl && key.name === 'c') {
      serverProcess.kill('SIGKILL')
      spawnSync('./ezpz/scripts/kill-port.sh')
      process.exit()
    } else if (key.name === 'r' && !controllerIsExecuting) {
      controllerIsExecuting = true
      serverProcess.kill('SIGKILL')
      if (serverProcess.killed) {
        console.log('killed server, restarting...')
        await startServer()
        await startController()
      } else {
        console.error(
          'server process failed to die, please restart app with control+c'
        )
      }
      controllerIsExecuting = false
    } else if (key.name === 'x' && !controllerIsExecuting) {
      controllerIsExecuting = true
      serverProcess.kill('SIGKILL')
      if (serverProcess.killed) {
        console.log('restarting everything...')
        process.stdin.removeAllListeners('keypress')
        console.time('dev-build-time')
        await genEtc()
        await startServer()
        await startController()
      } else {
        console.error(
          'server process failed to die, please restart app with control+c'
        )
      }
      controllerIsExecuting = false
    } else if (key.name === 'p' && !controllerIsExecuting) {
      controllerIsExecuting = true
      serverProcess.kill('SIGKILL')
      if (serverProcess.killed) {
        console.log('rebuilding pages, etc...')
        process.stdin.removeAllListeners('keypress')
        console.time('dev-build-time')
        await genPagesEtc()
        await startServer()
        await startController()
      } else {
        console.error(
          'server process failed to die, please restart app with control+c'
        )
      }
      controllerIsExecuting = false
    } else if (key.name === 'u' && !controllerIsExecuting) {
      controllerIsExecuting = true
      serverProcess.kill('SIGKILL')
      if (serverProcess.killed) {
        console.log('rebuilding routes, etc...')
        process.stdin.removeAllListeners('keypress')
        console.time('dev-build-time')
        await genRoutesEtc()
        await startServer()
        await startController()
      } else {
        console.error(
          'server process failed to die, please restart app with control+c'
        )
      }
      controllerIsExecuting = false
    } else if (key.name === 'l' && !controllerIsExecuting) {
      controllerIsExecuting = true
      serverProcess.kill('SIGKILL')
      if (serverProcess.killed) {
        console.log('rebuilding layouts, etc...')
        process.stdin.removeAllListeners('keypress')
        console.time('dev-build-time')
        await genLayoutsEtc()
        await startServer()
        await startController()
      } else {
        console.error(
          'server process failed to die, please restart app with control+c'
        )
      }
      controllerIsExecuting = false
    } else if (key.name === 's' && !controllerIsExecuting) {
      controllerIsExecuting = true
      serverProcess.kill('SIGKILL')
      if (serverProcess.killed) {
        console.log('rebuilding css/styles, etc...')
        process.stdin.removeAllListeners('keypress')
        console.time('dev-build-time')
        await genPostcssEtc()
        await startServer()
        await startController()
      } else {
        console.error(
          'server process failed to die, please restart app with control+c'
        )
      }
      controllerIsExecuting = false
    } else if (key.name === 'b' && !controllerIsExecuting) {
      controllerIsExecuting = true
      serverProcess.kill('SIGKILL')
      if (serverProcess.killed) {
        console.log('rebuilding bundle, etc...')
        process.stdin.removeAllListeners('keypress')
        console.time('dev-build-time')
        await genBundleEtc()
        await startServer()
        await startController()
      } else {
        console.error(
          'server process failed to die, please restart app with control+c'
        )
      }
      controllerIsExecuting = false
    }
  })
}

const buildBundle = async () => {
  console.time('build-bundle')
  await run('gen-bundle')
  console.timeEnd('build-bundle')
  console.timeEnd('dev-build-time')
}

const dev = async () => {
  spawnSync('./ezpz/scripts/kill-port.sh')
  await genEtc()
  await startServer()
  await startController()
}

const genEtc = async () => {
  await buildSetup()
  await buildPages()
  await buildRoutes()
  await buildLayouts()
  await buildRoutes2()
  await buildPostcss()
  await buildBundle()
}

const genPagesEtc = async () => {
  await buildPages()
  await buildRoutes()
  await buildLayouts()
  await buildRoutes2()
  await buildPostcss()
  await buildBundle()
}

const genRoutesEtc = async () => {
  await buildRoutes()
  await buildLayouts()
  await buildRoutes2()
  await buildPostcss()
  await buildBundle()
}

const genLayoutsEtc = async () => {
  await buildLayouts()
  await buildRoutes2()
  await buildPostcss()
  await buildBundle()
}

const genPostcssEtc = async () => {
  await buildPostcss()
  await buildBundle()
}

const genBundleEtc = async () => {
  await buildBundle()
}

dev()