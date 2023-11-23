import { Router, Request, Response } from 'express'
import { LoadStatus } from 'ezpz/types'

export const port = 3000

export const serverRoutes = async (router: Router) => {
  let message = 'some value here'
  let layoutMessage = 'some layout value here'

  router.get('/api', async (req: Request, res: Response) => {
    res.send({
      data: message,
      status: 'success' as LoadStatus,
    })
  })

  router.post('/api', async (req: Request, res: Response) => {
    message = req.body.message
    res.send({
      data: message,
      status: 'success' as LoadStatus,
    })
  })

  router.get('/api/layout', async (req: Request, res: Response) => {
    res.send({
      data: layoutMessage,
      status: 'success' as LoadStatus,
    })
  })

  router.post('/api/layout', async (req: Request, res: Response) => {
    message = req.body.message
    res.send({
      data: layoutMessage,
      status: 'success' as LoadStatus,
    })
  })
}