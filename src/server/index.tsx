import express, { Router } from 'express'
import ezpz_router, { sendPage } from '../../ezpz/server'
import { routes } from '../../bundle/routes_for_ssr'

console.log('\n\n\nezpz loading...\n')

// const project_root_dir = __dirname.split('/').slice(0, -1).join('/')
const port = 3000
const app = express()
const router = Router()
app.use('/scripts', express.static(`${__dirname}/../bundle/`))

// Insert your API routes below here

// you can override the default route here
// you can then use sendPage to send a page!
// router.get('/', (req, res) => {
//   console.log('what if i dont res.send?')
//   sendPage(routes[0], res)
// })

// Insert your API routes above here
router.use(ezpz_router)
app.use(router)
app.listen(port, () => {
  console.log(`\nApp loaded and listening on port ${port}!`)
})