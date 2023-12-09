export type ServerData = Map<string, Budget>
export type ServerDataEntries = ServerDataEntry[]
export type ServerDataEntry = [id: string, budget: Budget]

export type Budget = {
  iteration: Iteration,
  transactions: Transaction[],
}

export type Iteration = {
  id: string // type=month: YYYY-MM, type=unique: string
  type: 'month' | 'unique'
  startingBalance: number
}

export type Transaction = {
  id: string
  amount: number
  description: string
  date: number // unix timestamp
}