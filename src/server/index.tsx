import { Router, Request, Response } from 'express'
import { LoadStatus } from 'ezpz/types'
import { Budget, ServerData, ServerDataEntries } from 'src/_types/global'
import fs from 'fs'
import { authString } from '../../auth'
import { z } from 'zod'

export const port = 3000

const newBudget = (id: string, startingBalance: number): Budget => ({
  iteration: {
    id: id,
    type: 'month',
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

const z_ServerDataEntries = z.array(
  z.tuple([z.string(), z.object({
    iteration: z.object({
      id: z.string(),
      type: z.union([z.literal('month'), z.literal('unique')]),
      startingBalance: z.number(),
    }),
    transactions: z.array(
      z.object({
        id: z.string(),
        amount: z.number(),
        description: z.string(),
        date: z.string(),
      })
    ),
  })])
)

let dataFile: ServerData | undefined = undefined
if (fs.existsSync('data/data.json')) {
  dataFile = JSON.parse(
    fs.readFileSync('data/data.json', 'utf8'),
  )
} else {
  fs.mkdirSync('data')
  fs.writeFileSync('data/data.json', JSON.stringify([]))
}
let data: ServerData = new Map(dataFile ?? [])

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
          data.get(getLastMonth())?.iteration.startingBalance || 0,
        )
      )
    }

    res.send({
      data: Array.from(data.entries()),
      status: 'success' as LoadStatus,
    })
  })

  router.post('/api', async (req: Request, res: Response) => {
    if (req.body === undefined) {
      res.send({
        data: [],
        status: 'error' as LoadStatus,
        error: 'No data sent: C01',
      })
      return
    }

    let isAuthed = false
    if (req?.query?.auth === authString) isAuthed = true
    if (req.cookies?.auth === authString) isAuthed = true

    if (!isAuthed) {
      res.send({
        data: [],
        status: 'error' as LoadStatus,
        error: 'Not authorized: A01',
      })
      return
    }

    const dataEntries = req.body as ServerDataEntries

    if (dataEntries.length === 0) {
      res.send({
        data: [],
        status: 'error' as LoadStatus,
        error: 'No data sent: C02',
      })
      return
    }

    // TODO: validate data
    // const validatedDataEntries = z_ServerDataEntries.safeParse(dataEntries)

    // if (!validatedDataEntries.success) {
    //   res.send({
    //     data: [],
    //     status: 'error' as LoadStatus,
    //     error: 'Invalid data sent: C03',
    //   })
    //   return
    // }

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