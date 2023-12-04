import {
  Page,
  useServerSync,
  useState,
} from 'ezpz'
import { PageConfig, PageFC } from 'ezpz/types'
import { Text, TextInput, Button, Accordion } from '@mantine/core'
import EditText from './_components/EditText'
import { ServerDataEntries, Transaction } from 'src/_types/global'
import { v4 } from 'uuid'
import { getDate, getDaysInMonth, getWeek } from 'date-fns'
import { Progress } from '@mantine/core'

export const config: PageConfig = {
  title: 'Home',
  description: 'Home page description',
}

const Home: PageFC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setLocalData, setServerData, statusOfData] =
    useServerSync<ServerDataEntries>('budget_data', [], {})

  const [newAmount, setNewAmount] = useState<string>('')

  return (
    <Page config={config} id='page_comp'>
      <Accordion defaultValue={getCurrentMonth()}>
        {
          data.map(([monthId, value]) => {
            const month = value.month
            const transactions = value.transactions

            const spent = transactions.reduce((acc, cur) => acc + cur.amount, 0)
            const remainingBalance = month.startingBalance - spent

            const yearlyTotalSpendable = month.startingBalance * 12
            const weeklyTotalSpendable = yearlyTotalSpendable / 52
            const transactionsThisWeek = transactions.filter((transaction) => {
              const currentWeekOfYear = getWeek(new Date())
              const transactionWeekOfYear = getWeek(new Date(transaction.date))
              return currentWeekOfYear === transactionWeekOfYear
            })

            const weeklyTotalSpent = transactionsThisWeek.reduce((acc, cur) => acc + cur.amount, 0)
            const daysBurnedPercent = getDate(new Date()) / getDaysInMonth(new Date()) * 100
            const dollarsBurnedPercent = spent / month.startingBalance * 100

            return (
              <Accordion.Item
                key={monthId}
                value={monthId}
              >
                <Accordion.Control>
                  <Text
                    size='xl'
                    fw={700}
                  >
                    {monthNumberToMonthWord(monthId.slice(5, 7))} - {monthId.slice(0, 4)}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel className='max-h-60vh'>
                  <div className='flex w-full justify-between -mb-4'>
                    <Text size='xl' fw={500} mb='lg'
                      className='flex-auto'
                    >
                      Remaining: ${amountToDollars(remainingBalance)}
                    </Text>
                    <EditText size='xl' fw={500} mb='lg' c='dimmed'
                      prefix={`/ `}
                      value={amountToDollars(month.startingBalance)}
                      onSave={(newVal) => {
                        setServerData((prev) => {
                          return updateStartingBalance(prev, month.id, newVal)
                        })
                      }}
                    />
                  </div>
                  <Progress.Root size="xl">
                    <Progress.Section
                      value={daysBurnedPercent}
                      color="cyan"
                    >
                      <Progress.Label>Days</Progress.Label>
                    </Progress.Section>
                  </Progress.Root>
                  <Progress.Root size="xl">
                    <Progress.Section
                      value={dollarsBurnedPercent}
                      color={
                        daysBurnedPercent < dollarsBurnedPercent ?
                          'red' : 'green'
                      }
                    >
                      <Progress.Label>Dollars</Progress.Label>
                    </Progress.Section>
                  </Progress.Root>
                  <div className='flex w-full justify-between mt-2'>
                    <Text size='sm' fw={500} mb='lg' c='dimmed'
                      className='flex-auto'
                    >
                      This Week Annually: ${amountToDollars(weeklyTotalSpendable - weeklyTotalSpent)} / ${amountToDollars(weeklyTotalSpendable)}
                    </Text>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-12 mr-1'>New:</div>
                    <TextInput
                      className='flex-auto'
                      type='number'
                      leftSection='$'
                      size='md'
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                    <Button
                      className='ml-2'
                      onClick={() => {
                        setServerData(
                          addTransaction(
                            data, month.id, newAmount,
                          ) as ServerDataEntries
                        )
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className='mt-5 max-h-[240px] overflow-scroll'>
                    {
                      transactions.sort((a, b) => (b.date - a.date)).map((transaction) => (
                        <div key={transaction.id} className='flex justify-between'>
                          <div className='flex'>
                            <div className='flex mr-2 text-right font-mono'>
                              <EditText size='md' fw={500} mb='lg'
                                prefix='$ '
                                value={amountToDollars(transaction.amount)}
                                onSave={(newVal) => {
                                  setServerData(
                                    updateTransaction({
                                      _entries: data,
                                      _monthId: month.id,
                                      _transactionId: transaction.id,
                                      _keyToUpdate: 'amount',
                                      _newVal: newVal,
                                    }) as ServerDataEntries
                                  )
                                }}
                              />
                            </div>
                            <div className='flex-grow max-w-[200px]'>
                              <EditText size='md' fw={500} mb='lg' c='dimmed'
                                prefix=' - '
                                value={transaction.description}
                                onSave={(newVal) => {
                                  setServerData(
                                    updateTransaction({
                                      _entries: data,
                                      _monthId: month.id,
                                      _transactionId: transaction.id,
                                      _keyToUpdate: 'description',
                                      _newVal: newVal,
                                    }) as ServerDataEntries
                                  )
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <Text c='dimmed' className='italic'>{new Date(transaction.date).toLocaleDateString().split('/').slice(0, 2).join('-')}</Text>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            )
          })
        }
      </Accordion>
    </Page>
  )
}

const amountToDollars = (amount: number) => {
  return `${(amount * 0.01).toFixed(2)}`
}

const dollarsToAmount = (dollars: string) => {
  return parseInt(
    (parseFloat(dollars.replace(/[^0-9.]/g, '')) * 100).toFixed(0)
  )
}

const updateStartingBalance = (
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
  _newVal: string
}

const updateTransaction = ({
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
                    dollarsToAmount(_newVal) :
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

const addTransaction = (
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

const monthNumberToMonthWord = (monthNumber: string) => {
  switch (monthNumber) {
    case '1':
      return 'January'
    case '2':
      return 'February'
    case '3':
      return 'March'
    case '4':
      return 'April'
    case '5':
      return 'May'
    case '6':
      return 'June'
    case '7':
      return 'July'
    case '8':
      return 'August'
    case '9':
      return 'September'
    case '10':
      return 'October'
    case '11':
      return 'November'
    case '12':
      return 'December'
  }
}

const formattedMonth = (month: number): string => {
  return month < 9 ? `0${month + 1}` : `${month + 1}`
}

const getCurrentMonth = (): string => {
  const date = new Date()
  return `${date.getFullYear()}-${formattedMonth(date.getMonth())}`
}

export default Home