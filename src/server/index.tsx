import express, { Router, Request, Response } from 'express'
import bodyParser from 'body-parser'
import { LoadStatus, ServerResponse } from 'ezpz/types'
import ezpz_router, { sendPage } from '../../ezpz/server'
import { middleware } from './middleware'
// import { routes } from '../../bundle/routes_for_ssr'

// const project_root_dir = __dirname.split('/').slice(0, -1).join('/')
const port = 3000
const app = express()
app.use(
  '/scripts',
  express.static(`${__dirname}/../../bundle/`),
)
app.use(
  '/bundle/main.css',
  express.static(`${__dirname}/../../bundle/main.css`),
)
app.use(express.json())

const router = Router()

// router.use(middleware)

// Insert your API routes below here

// you can override the default route here
// you can then use sendPage to send a page!
// router.get('/', (req, res) => {
//   console.log('what if i dont res.send?')
//   sendPage(routes[0], res)
// })

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let message = 'poop nugget'

router.get('/api', async (req: Request, res: Response) => {
  await timeout(250)
  console.log('message: ', message)
  res.send({
    data: message,
    status: 'success' as LoadStatus,
  })
})

router.post('/api', async (req: Request, res: Response) => {
  await timeout(250)
  message = req.body.message
  console.log('message: ', message)
  res.send({
    data: message,
    status: 'success' as LoadStatus,
  })
})

// Insert your API routes above here
router.use(ezpz_router)
app.use(router)
app.listen(port, () => {
  console.log(`\nApp loaded and listening on port ${port}!`)
})