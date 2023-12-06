import { ServerDataEntries } from "src/_types/global"
import { v4 } from "uuid"
import { dollarsToAmount } from "./conversions"

export const addTransaction = (
  _entries: ServerDataEntries,
  _key: string,
  _newVal: string,
) => {
  return _entries.map(([key, value]) => {
    if (key === _key) {
      return [
        key,
        {
          ...value,
          transactions: [
            ...value.transactions,
            {
              id: v4(),
              amount: dollarsToAmount(_newVal),
              description: 'No description',
              date: new Date().getTime(),
            },
          ],
        },
      ]
    }
    return [key, value]
  })
}