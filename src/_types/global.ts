export type ServerData = Map<string, Budget>
export type ServerDataEntries = [string, Budget][]

export type Budget = {
  month: Month,
  transactions: Transaction[],
}

export type Month = {
  id: string
  startingBalance: number
}

export type Transaction = {
  id: string
  amount: number
  description: string
  date: number // unix timestamp
}