import {
  Page,
  useServerSync,
  useState,
  useEffect,
  LoadHandler,
} from 'ezpz'
import { PageConfig, PageFC } from 'ezpz/types'
import { Accordion, Skeleton, Text } from '@mantine/core'
import { Budget, ServerDataEntries, ServerDataEntry, Transaction } from 'src/_types/global'
import BudgetIteration from './_components/BudgetIteration'
import { updateStartingBalance, updateTransaction } from './_helpers/updates'
import { addTransaction } from './_helpers/additions'
import { deleteTransaction } from './_helpers/deletes'
import { isValidAmount } from './_helpers/guards'
import { formattedMonth } from './_helpers/conversions'

export const config: PageConfig = {
  title: 'Home',
  description: 'Home page description',
}

const Home: PageFC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setLocalData, setServerData, statusOfData] =
    useServerSync<ServerDataEntries>('budget_data', [], {})

  const [newAmount, setNewAmount] = useState<string>('')

  const [value, setValue] = useState<string | null>(null)

  useEffect(() => {
    if (data.length === 0) return
    if (!value) { setValue(data?.[0]?.[0] || getCurrentMonth()) }
  }, [data, value])

  return (
    <Page config={config} id='page_comp'>
      <LoadHandler
        status={statusOfData}
        first_load={
          <Accordion defaultValue={'loading'}>
            <Accordion.Item value={'loading'}>
              <Accordion.Control h={57}>
                <Skeleton height={20} w={180} radius="xl" />
              </Accordion.Control>
              <Accordion.Panel>
                <div className='flex flex-row justify-between'>
                  <Skeleton height={20} w={180} radius="xl" mt={6} />
                  <Skeleton height={20} w={70} radius="xl" mt={6} />
                </div>
                <Skeleton height={100} radius="xl" mt={6} />
                <Skeleton height={16} w={240} radius="xl" mt={10} />
                <div className='flex flex-row justify-between'>
                  <Skeleton height={16} w={50} radius="xl" mt={34}
                    className='mr-2'
                  />
                  <Skeleton height={40} radius="xl" mt={20}
                    className='flex flex-grow'
                  />
                  <Skeleton height={36} w={96} radius="xl" mt={22}
                    className='ml-2'
                  />
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        }
        success={
          <Accordion value={value} onChange={setValue}>
            {
              data.map(([id, value]) => (
                <BudgetIteration
                  key={id}
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
        }
      />
    </Page>
  )
}

const getCurrentMonth = (): string => {
  const date = new Date()
  return `${date.getFullYear()}-${formattedMonth(date.getMonth())}`
}

export default Home