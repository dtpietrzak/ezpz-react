import { ServerDataEntries, Transaction } from "src/_types/global"
import { dollarsToAmount } from "./conversions"


export const updateStartingBalance = (
  _entries: ServerDataEntries,
  _key: string,
  _newVal: string,
): ServerDataEntries => {
  return _entries.map(([key, value]) => {
    if (key === _key) {
      return [
        key,
        {
          ...value,
          month: {
            ...value.month,
            startingBalance: dollarsToAmount(_newVal),
          },
        },
      ]
    }
    return [key, value]
  })
}

type UpdateTransactionProps = {
  _entries: ServerDataEntries
  _monthId: string
  _transactionId: string
  _keyToUpdate: keyof Transaction
  _newVal: string | number
}

export const updateTransaction = ({
  _entries,
  _monthId,
  _transactionId,
  _keyToUpdate,
  _newVal,
}: UpdateTransactionProps) => {
  return _entries.map(([key, value]) => {
    if (key === _monthId) {

      for (let i = 0; i < value.transactions.length; i++) {
        if (value.transactions[i].id === _transactionId) {
          return [
            key,
            {
              ...value,
              transactions: [
                ...value.transactions.slice(0, i),
                {
                  ...value.transactions[i],
                  [_keyToUpdate]: _keyToUpdate === 'amount' ?
                    dollarsToAmount(_newVal.toString()) :
                    _newVal,
                },
                ...value.transactions.slice(i + 1),
              ],
            },
          ]
        }
      }
    }
    return [key, value]
  })
}