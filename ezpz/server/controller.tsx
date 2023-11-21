// const startController = async () => {
//   controllerIsExecuting = false
//   readline.emitKeypressEvents(process.stdin)
//   process.stdin.setRawMode(true)

//   console.log('press control+c to exit')
//   console.log(`
//   r - reload server
//   b - rebuild bundle, etc...
//   s - rebuild css/styles, etc...
//   l - rebuild layouts, etc...
//   u - rebuild routes, etc...
//   p - rebuild pages, etc...
//   x - restart everything
//   `)

//   process.stdin.on('keypress', async (str, key) => {
//     if (key.ctrl && key.name === 'c') {
//       serverProcess.kill('SIGKILL')
//       spawnSync('./ezpz/scripts/kill-port.sh')
//       process.exit()
//     } else if (key.name === 'r' && !controllerIsExecuting) {
//       controllerIsExecuting = true
//       serverProcess.kill('SIGKILL')
//       if (serverProcess.killed) {
//         console.log('killed server, restarting...')
//         // await startServer()
//         await startController()
//       } else {
//         console.error(
//           'server process failed to die, please restart app with control+c'
//         )
//       }
//       controllerIsExecuting = false
//     } else if (key.name === 'x' && !controllerIsExecuting) {
//       controllerIsExecuting = true
//       serverProcess.kill('SIGKILL')
//       if (serverProcess.killed) {
//         console.log('restarting everything...')
//         process.stdin.removeAllListeners('keypress')
//         console.time('dev-build-time')
//         await genEtc()
//         // await startServer()
//         await startController()
//       } else {
//         console.error(
//           'server process failed to die, please restart app with control+c'
//         )
//       }
//       controllerIsExecuting = false
//     } else if (key.name === 'p' && !controllerIsExecuting) {
//       controllerIsExecuting = true
//       serverProcess.kill('SIGKILL')
//       if (serverProcess.killed) {
//         console.log('rebuilding pages, etc...')
//         process.stdin.removeAllListeners('keypress')
//         console.time('dev-build-time')
//         // await genPagesEtc()
//         // await startServer()
//         await startController()
//       } else {
//         console.error(
//           'server process failed to die, please restart app with control+c'
//         )
//       }
//       controllerIsExecuting = false
//     } else if (key.name === 'u' && !controllerIsExecuting) {
//       controllerIsExecuting = true
//       serverProcess.kill('SIGKILL')
//       if (serverProcess.killed) {
//         console.log('rebuilding routes, etc...')
//         process.stdin.removeAllListeners('keypress')
//         console.time('dev-build-time')
//         // await genRoutesEtc()
//         // await startServer()
//         await startController()
//       } else {
//         console.error(
//           'server process failed to die, please restart app with control+c'
//         )
//       }
//       controllerIsExecuting = false
//     } else if (key.name === 'l' && !controllerIsExecuting) {
//       controllerIsExecuting = true
//       serverProcess.kill('SIGKILL')
//       if (serverProcess.killed) {
//         console.log('rebuilding layouts, etc...')
//         process.stdin.removeAllListeners('keypress')
//         console.time('dev-build-time')
//         // await genLayoutsEtc()
//         // await startServer()
//         await startController()
//       } else {
//         console.error(
//           'server process failed to die, please restart app with control+c'
//         )
//       }
//       controllerIsExecuting = false
//     } else if (key.name === 's' && !controllerIsExecuting) {
//       controllerIsExecuting = true
//       serverProcess.kill('SIGKILL')
//       if (serverProcess.killed) {
//         console.log('rebuilding css/styles, etc...')
//         process.stdin.removeAllListeners('keypress')
//         console.time('dev-build-time')
//         // await genPostcssEtc()
//         // await startServer()
//         await startController()
//       } else {
//         console.error(
//           'server process failed to die, please restart app with control+c'
//         )
//       }
//       controllerIsExecuting = false
//     } else if (key.name === 'b' && !controllerIsExecuting) {
//       controllerIsExecuting = true
//       serverProcess.kill('SIGKILL')
//       if (serverProcess.killed) {
//         console.log('rebuilding bundle, etc...')
//         process.stdin.removeAllListeners('keypress')
//         console.time('dev-build-time')
//         // await genBundleEtc()
//         // await startServer()
//         await startController()
//       } else {
//         console.error(
//           'server process failed to die, please restart app with control+c'
//         )
//       }
//       controllerIsExecuting = false
//     }
//   })
// }