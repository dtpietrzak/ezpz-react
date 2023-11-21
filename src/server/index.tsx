import { Router, Request, Response } from 'express'
import { LoadStatus } from 'ezpz/types'

export const port = 3000

export const serverRoutes = async (router: Router) => {
  let message = 'poop nugget'

  router.get('/api', async (req: Request, res: Response) => {
    console.log('message: ', message)
    res.send({
      data: message,
      status: 'success' as LoadStatus,
    })
  })

  router.post('/api', async (req: Request, res: Response) => {
    message = req.body.message
    console.log('message: ', message)
    res.send({
      data: message,
      status: 'success' as LoadStatus,
    })
  })
}