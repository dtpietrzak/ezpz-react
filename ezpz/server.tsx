import { URL } from 'url'
import express, { Router, Request, Response, Application, Express } from 'express'
import { RouteSSR } from 'ezpz/types'
import { port, serverRoutes } from 'src/server'


let server: ReturnType<Application['listen']> | null = null

const __dirname = new URL('.', import.meta.url).pathname

export let router: Router | null = null
export let app: Express | null = null


export const prepServer = async () => {
  router = Router()
  app = express()
  app.use(express.json())
  app.use(
    '/bundle',
    express.static(`${__dirname}/../bundle/`),
  )
  app.use(
    '/bundle/main.css',
    express.static(`${__dirname}/../bundle/main.css`),
  )

  await serverRoutes(router)
}

export const startServer = async () => {
  app!.use(router!)

  if (!server) {
    server = app!.listen(port, () => {
      console.log(`\nApp loaded and listening on port ${port}!`)
    })
  }
}

export const stopServer = async () => {
  app = null
  router = null
  return new Promise((resolve, reject) => {
    if (server) {
      server?.close((err) => {
        if (err) reject(err)
        server = null
        console.log('server closed')
        resolve(true)
      })
      resolve(true)
    } else {
      reject('server is not defined')
    }
  })
}

type AnyFunction<R = any> = (...args: any[]) => (R | Promise<R>)
export const restartServer = async (between?: AnyFunction) => {
  await stopServer()
  if (between) await between()
  await startServer()
}





export const updateRoutes = async (
  routeContent: (route: RouteSSR) => Promise<string>,
) => {
  const routes = (await import('build/routing/routes_for_ssr')).routes

  routes.forEach((route) => {
    router!.get(
      route.path,
      async (req: Request, res: Response) => {
        res.send(await routeContent(route))
      },
    )
  })
}