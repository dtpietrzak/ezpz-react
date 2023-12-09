import { ServerDataEntries } from "src/_types/global"

type DeleteTransactionProps = {
  _entries: ServerDataEntries
  _id: string
  _transactionId: string
}

export const deleteTransaction = ({
  _entries,
  _id,
  _transactionId,
}: DeleteTransactionProps) => {
  return _entries.map(([key, value]) => {
    if (key === _id) {

      for (let i = 0; i < value.transactions.length; i++) {
        if (value.transactions[i].id === _transactionId) {
          return [
            key,
            {
              ...value,
              transactions: value.transactions.filter(
                (transaction) => (transaction.id !== _transactionId)
              ),
            },
          ]
        }
      }
    }
    return [key, value]
  })
}