import { renderToString } from 'react-dom/server'
import express, { Request, Response, Router } from 'express'
import App from '../app';
import routes from '../bundle/routes.json'

console.log('\n\n\nApp loading...\n')

// remove last item from __dirname
const project_root_dir = __dirname.split('/').slice(0, -1).join('/')

const root_dir = `${project_root_dir}/src/pages`
const app = express()
const port = 3000
const router = Router()

const test_route_for_import = (root_dir + routes.index + '.tsx')

console.log(test_route_for_import)

const importedRoute = require(test_route_for_import)
const component = importedRoute.default()

app.use('/scripts', express.static(`${__dirname}/../bundle/`))

console.log(routes.index)

router.get(
  routes.index.replace('index', ''),
  (
    req: Request,
    res: Response,
  ) => {
    res.send(renderToString(
      <App title={req.path}>
        {component}
      </App>
    ))
  },
)

app.use(router)

// app.get('/', (req: Request, res: Response) => {
//   const path = req.path;

//   res.send(renderToString(
//     <App title={path} />
//   ))
//   // res.sendFile('index.html', { root: `${__dirname}/../` })
// })


app.listen(port, () => {
  console.log(`\nDevelopment app loaded and listening on port ${port}!`)
})