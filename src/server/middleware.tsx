import { Request, Response, NextFunction } from "express"

export const middleware = async (
  req: Request, res: Response, next: NextFunction,
) => {
  console.log(req.body)
  next()
}