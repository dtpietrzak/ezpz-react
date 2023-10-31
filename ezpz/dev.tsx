import { renderToString } from 'react-dom/server'
import express, { Request, Response, Router } from 'express'
import App from '../app';
import { routes } from '../bundle/routes_for_router'
import { scriptLoader } from './script-loader'
import { config } from 'ezpz.config';

console.log('\n\n\nApp loading...\n')

const project_root_dir = __dirname.split('/').slice(0, -1).join('/')

const app = express()
const port = 3000
const router = Router()

app.use('/scripts', express.static(`${__dirname}/../bundle/`))

routes.forEach((
  route,
) => {
  router.get(
    route.path,
    (
      req: Request,
      res: Response,
    ) => {
      res.send(renderToString(
        <App title={(route?.title || config?.app_name) ?? ''}>
          {route.Component()}
        </App>
      ).replace('__script_injection__', scriptLoader))
    },
  )
})

app.use(router)

// app.get('/*', (req: Request, res: Response) => {
//   const path = req.path;

//   res.send(renderToString(
//     <App title={path} />
//   ).replace('__log_statement__', '\"initial html loaded\"'))
//   // res.sendFile('index.html', { root: `${__dirname}/../` })
// })


app.listen(port, () => {
  console.log(`\nDevelopment app loaded and listening on port ${port}!`)
})