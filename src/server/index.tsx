import { Router, Request, Response } from 'express'
import { LoadStatus } from 'ezpz/types'
import { Budget, ServerData, ServerDataEntries } from 'src/_types/global'
import fs from 'fs'

export const port = 3000
const authString = 'ilovemyfamily!'

const newBudget = (id: string, startingBalance: number): Budget => ({
  month: {
    id: id,
    startingBalance: startingBalance,
  },
  transactions: [],
})

const formattedMonth = (month: number): string => {
  return month < 9 ? `0${month + 1}` : `${month + 1}`
}

const getCurrentMonth = (): string => {
  const date = new Date()
  return `${date.getFullYear()}-${formattedMonth(date.getMonth())}`
}

const getLastMonth = (): string => {
  const date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() - 1;

  if (month < 0) {
    // If the current month is January, adjust the year and set month to December
    year -= 1;
    month = 11; // December is represented as 11 in JavaScript Date object
  }

  return `${year}-${formattedMonth(month)}`;
}


const dataFile: ServerData = JSON.parse(
  fs.readFileSync('data/data.json', 'utf8'),
)

let data: ServerData = new Map(dataFile)

export const serverRoutes = async (router: Router) => {

  router.get('/api', async (req: Request, res: Response) => {
    let isAuthed = false
    if (req?.query?.auth === authString) isAuthed = true
    if (req.cookies?.auth === authString) isAuthed = true

    if (!isAuthed) {
      res.send({
        data: [],
        status: 'error' as LoadStatus,
        error: 'Not authorized',
      })
      return
    }

    const currentMonth = getCurrentMonth()

    // ensures we have a current month
    // adds new current month if we don't have one
    // uses last month to set starting balance if we have one
    if (!data.has(currentMonth)) {
      data.set(
        currentMonth,
        newBudget(
          currentMonth,
          data.get(getLastMonth())?.month.startingBalance || 0,
        )
      )
    }

    res.send({
      data: Array.from(data.entries()),
      status: 'success' as LoadStatus,
    })
  })

  router.post('/api', async (req: Request, res: Response) => {
    let isAuthed = false
    if (req?.query?.auth === authString) isAuthed = true
    if (req.cookies?.auth === authString) isAuthed = true

    if (!isAuthed) {
      res.send({
        data: [],
        status: 'error' as LoadStatus,
        error: 'Not authorized',
      })
      return
    }

    const dataEntries = req.body as ServerDataEntries

    data = new Map(dataEntries)
    fs.writeFileSync(
      'data/data.json',
      JSON.stringify(dataEntries),
      'utf8',
    )

    res.send({
      data: Array.from(data.entries()),
      status: 'success' as LoadStatus,
    })
  })
}