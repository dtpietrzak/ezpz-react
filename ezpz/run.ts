console.log('Hello World!')

import express, { Request, Response } from 'express'
import path from 'path'

const app = express()
const port = 3000

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.listen(port, () => {
  console.log(`Production app listening on port ${port}`)
})