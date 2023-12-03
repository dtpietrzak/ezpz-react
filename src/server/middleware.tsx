import { Request, Response, NextFunction } from "express"

export const middleware = async (
  req: Request, res: Response, next: NextFunction,
) => {
  if (req.method === 'POST') {
    console.log('middleware-POST / body data: ', req.body)
    console.log('middleware-GET / cookie data:', req.cookies)
  } else if (req.method === 'GET') {
    console.log('middleware-GET / query data:', req.query)
    console.log('middleware-GET / cookie data:', req.cookies)
  }

  next()
}