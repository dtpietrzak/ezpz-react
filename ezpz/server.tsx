import { renderToString } from 'react-dom/server'
import { Request, Response, Router } from 'express'
import App from '../app'
import { routes } from '../build/routing/routes_for_ssr'
import scriptLoader from './scripts/script-loader'
import { Route } from 'ezpz/types'
import BasicLayout from 'src/pages/layout'

// const project_root_dir = __dirname.split('/').slice(0, -1).join('/')

// need to update functions to use UID or initIds or something

const router = Router()

export const sendPage = async (route: Route, res: Response) => {
  const funcEntries = await Promise.all(
    route.loadFunctions.map(async (lf) => {
      return [lf.uid, (await lf.function()).data]
    })
  )
  const dataArray = funcEntries.map(([_, data]) => data)
  const funcObject = Object.fromEntries(funcEntries)

  const WithLayouts = () => {
    if (!route.Layouts || route.Layouts.length === 0) {
      return route.Component(...dataArray)
    } else {
      return route.Layouts.reduce((acc, Layout) => {
        if (!Layout) return acc
        return (<Layout>{acc}</Layout>)
      }, route.Component(...dataArray)
      )
    }
  }

  const html = renderToString(
    <App pageConfig={route.config}>
      {WithLayouts()}
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