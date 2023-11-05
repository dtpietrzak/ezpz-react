import { renderToString } from 'react-dom/server'
import { Request, Response, Router } from 'express'
import App from '../app'
import { routes, Route } from '../bundle/routes_for_ssr'
import { scriptLoader } from './scripts/script-loader'
import { config } from 'ezpz.config'

// const project_root_dir = __dirname.split('/').slice(0, -1).join('/')

const router = Router()


export const sendPage = async (route: Route, res: Response) => {
  const funcEntries = await Promise.all(route.loadFunctions
    .map(async (lf: any) => {
      return [lf.name, (await lf.function()).data]
    })
  )
  const dataArray = funcEntries.map(([_, data]) => data)
  const funcObject = Object.fromEntries(funcEntries)

  const html = renderToString(
    <App title={(route.title || config?.app_name) ?? ''}>
      {await route.Component(...dataArray)}
    </App>
  ).replace('__script_injection__', scriptLoader)

  res.send(`${html}
        <script>
          window.__initial_data__ = ${JSON.stringify(funcObject)}
        </script>
    `)
}


routes.forEach((route) => {
  router.get(
    route.path,
    async (req: Request, res: Response) => {
      sendPage(route, res)
    },
  )
})


// app.get('/*', (req: Request, res: Response) => {
//   const path = req.path;

//   res.send(renderToString(
//     <App title={path} />
//   ).replace('__log_statement__', '\"initial html loaded\"'))
//   // res.sendFile('index.html', { root: `${__dirname}/../` })
// })

export default router