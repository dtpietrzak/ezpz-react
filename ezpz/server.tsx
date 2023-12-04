import { URL } from 'url'
import express, { Router, Request, Response, Application, Express } from 'express'
import cookieParser from 'cookie-parser'
import { LayoutSSR, RouteSSR } from 'ezpz/types'
import { port, serverRoutes } from 'src/server'
import { middleware } from 'src/server/middleware'
import rateLimit from 'express-rate-limit'


let server: ReturnType<Application['listen']> | null = null

const __dirname = new URL('.', import.meta.url).pathname

export let router: Router | null = null
export let app: Express | null = null


export const prepServer = async () => {
  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Use an external store for consistency across multiple server instances.
  })

  router = Router()
  app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use(
    '/bundle',
    express.static(`${__dirname}/../bundle/`),
  )
  app.use(
    '/bundle/main.css',
    express.static(`${__dirname}/../bundle/main.css`),
  )
  app.use(limiter)

  app.use(middleware)

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
  routeContent: (route: RouteSSR, layout?: LayoutSSR) => Promise<string>,
) => {
  const routes = (await import('build/routing/routes_for_ssr')).routes
  const layouts_map = (await import('build/layouts/layouts_for_ssr')).layouts_map

  routes.forEach((route) => {
    router!.get(
      route.path,
      async (req: Request, res: Response) => {
        res.send(await routeContent(route, layouts_map.get(route.path)))
      },
    )
  })
}