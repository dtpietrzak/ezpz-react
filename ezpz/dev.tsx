import { renderToString } from 'react-dom/server'
import express, { Request, Response, Router } from 'express'
import App from '../app';
import routes from '../bundle/routes.json'

const root_dir = `${__dirname}/../src/pages`
const app = express()
const port = 3000
const router = Router()

const test_route = (root_dir + routes.index + 'index.tsx')
const importedRoute = require(test_route)
const component = importedRoute.default()

app.use('/scripts', express.static(`${__dirname}/../bundle/`))

// router.use(
//   routes.dashboard.index,
//   (
//     req: Request,
//     res: Response,
//   ) => {
//     res.send(renderToString(
//       <App title={req.path}>
//         {component}
//       </App>
//     ))
//   },
// )

// app.use(router)

app.get('/', (req: Request, res: Response) => {
  const path = req.path;

  res.send(renderToString(
    <App title={path} />
  ))
  // res.sendFile('index.html', { root: `${__dirname}/../` })
})


app.listen(port, () => {
  console.log(`Development app listening on port ${port}`)
})