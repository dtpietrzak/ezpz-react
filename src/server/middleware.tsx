import { Request, Response, NextFunction } from 'express'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const middleware = async (
  req: Request, res: Response, next: NextFunction,
) => {
  await sleep(1000)
  next()
}