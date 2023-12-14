import {
  Page,
  useServerSync,
  useState,
  useEffect,
  susMap,
} from 'ezpz'
import { LoadStatus, PageConfig, PageFC } from 'ezpz/types'
import { Accordion } from '@mantine/core'
import { ServerDataEntries } from 'src/_types/global'
import BudgetIteration from './_components/BudgetIteration'
import { updateStartingBalance, updateTransaction } from './_helpers/updates'
import { addTransaction } from './_helpers/additions'
import { deleteTransaction } from './_helpers/deletes'
import { isValidAmount } from './_helpers/guards'

export const config: PageConfig = {
  title: 'Home',
  description: 'Home page description',
}

const foeServerData: ServerDataEntries = [
  ['loading', {
    iteration: {
      id: 'loading',
      type: 'month',
      startingBalance: 0,
    },
    transactions: [],
  }]
]

const Home: PageFC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setLocalData, setServerData, statusOfData] =
    useServerSync<ServerDataEntries>('budget_data', [], {})

  const [newAmount, setNewAmount] = useState<string>('')

  const [selectedIteration, setSelectedIteration] =
    useState<string | null>('loading')
  const [lastStatus, setLastStatus] = useState<LoadStatus>('first_load')

  useEffect(() => {
    setLastStatus(statusOfData)
    if (data.length === 0) return
    if (
      lastStatus === 'first_load' ||
      lastStatus === 'local_load'
    ) {
      setSelectedIteration(data?.[0]?.[0])
    }
  }, [data, selectedIteration, statusOfData, lastStatus])

  return (
    <Page config={config} id='page_comp'>
      <Accordion value={selectedIteration} onChange={setSelectedIteration}>
        {
          susMap(data, statusOfData, foeServerData, ([id, value]) => (
            <BudgetIteration
              key={id}
              isSelected={id === selectedIteration}
              newAmount={newAmount}
              iteration={value.iteration}
              transactions={value.transactions}
              statusOfData={statusOfData}

              onAddNewTransaction={() => {
                if (!isValidAmount(newAmount)) return
                setServerData(
                  addTransaction(
                    data, id, newAmount,
                  ) as ServerDataEntries
                ).then(() => setNewAmount(''))
              }}
              onUpdateNewAmount={(newAmount) => setNewAmount(newAmount)}
              onUpdateBudgetTotal={(newTotal) => {
                if (!isValidAmount(newTotal)) return
                setServerData((prev) => {
                  return updateStartingBalance(prev, id, newTotal)
                })
              }}
              onUpdateTransaction={(
                transactionId, newVal, key,
              ) => {
                if (key === 'amount' && !isValidAmount(newVal)) return
                setServerData(
                  updateTransaction({
                    _entries: data,
                    _id: id,
                    _transactionId: transactionId,
                    _keyToUpdate: key,
                    _newVal: newVal,
                  }) as ServerDataEntries
                )
              }}
              onDeleteTransaction={(transactionId) => {
                setServerData(
                  deleteTransaction({
                    _entries: data,
                    _id: id,
                    _transactionId: transactionId,
                  }) as ServerDataEntries
                )
              }}
            />
          ))
        }
      </Accordion>
    </Page>
  )
}

export default Home