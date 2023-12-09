import {
  Page,
  useServerSync,
  useState,
  useEffect,
} from 'ezpz'
import { PageConfig, PageFC } from 'ezpz/types'
import { Accordion } from '@mantine/core'
import { Budget, ServerDataEntries, ServerDataEntry, Transaction } from 'src/_types/global'
import { formattedMonth } from './_helpers/conversions'
import BudgetIteration from './_components/BudgetIteration'
import { updateStartingBalance, updateTransaction } from './_helpers/updates'
import { addTransaction } from './_helpers/additions'
import { deleteTransaction } from './_helpers/deletes'

export const config: PageConfig = {
  title: 'Home',
  description: 'Home page description',
}

const Home: PageFC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setLocalData, setServerData, statusOfData] =
    useServerSync<ServerDataEntries>('budget_data', [], {})

  const [newAmount, setNewAmount] = useState<string>('')

  const [migrationComplete, setMigrationComplete] = useState<boolean>(false)
  // migration
  useEffect(() => {
    console.log('data: ', data)
    console.log('migrationComplete: ', migrationComplete)
    if (!data || data?.length === 0 || migrationComplete) return
    const newData = data.map(([monthId, value]) => {
      if (!value.iteration?.type) {
        const budget = {
          ...value,
          iteration: {
            // @ts-ignore
            ...value.month,
            type: 'monthly',
          },
        }
        // @ts-ignore
        delete budget?.month
        return [monthId, budget] satisfies ServerDataEntry
      } else {
        // @ts-ignore
        delete value?.month
        return [monthId, value] satisfies ServerDataEntry
      }
    })
    setServerData(newData)
    setMigrationComplete(true)
  }, [data, migrationComplete])

  // @ts-ignore
  if (data?.[0]?.month) return null

  return (
    <Page config={config} id='page_comp'>
      <Accordion defaultValue={getCurrentMonth()}>
        {
          // data.map(([monthId, value]) => (
          //   <BudgetIteration
          //     key={monthId}
          //     newAmount={newAmount}
          //     iteration={value.iteration}
          //     transactions={value.transactions}
          //     statusOfData={statusOfData}

          //     onAddNewTransaction={() => {
          //       setServerData(
          //         addTransaction(
          //           data, monthId, newAmount,
          //         ) as ServerDataEntries
          //       ).then(() => setNewAmount(''))
          //     }}
          //     onUpdateNewAmount={(newAmount) => setNewAmount(newAmount)}
          //     onUpdateBudgetTotal={(newTotal) => {
          //       setServerData((prev) => {
          //         return updateStartingBalance(prev, monthId, newTotal)
          //       })
          //     }}
          //     onUpdateTransaction={(
          //       transactionId, newVal, key,
          //     ) => {
          //       setServerData(
          //         updateTransaction({
          //           _entries: data,
          //           _monthId: monthId,
          //           _transactionId: transactionId,
          //           _keyToUpdate: key,
          //           _newVal: newVal,
          //         }) as ServerDataEntries
          //       )
          //     }}
          //     onDeleteTransaction={(transactionId) => {
          //       setServerData(
          //         deleteTransaction({
          //           _entries: data,
          //           _monthId: monthId,
          //           _transactionId: transactionId,
          //         }) as ServerDataEntries
          //       )
          //     }}
          //   />
          // ))
        }
      </Accordion>
    </Page>
  )
}


const getCurrentMonth = (): string => {
  const date = new Date()
  return `${date.getFullYear()}-${formattedMonth(date.getMonth())}`
}

export default Home