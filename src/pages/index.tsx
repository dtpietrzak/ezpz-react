import {
  Page,
  useServerSync,
  useState,
} from 'ezpz'
import { PageConfig, PageFC } from 'ezpz/types'
import { Text, TextInput, Button, Accordion, ScrollArea } from '@mantine/core'
import EditText from './_components/EditText'
import { ServerDataEntries } from 'src/_types/global'
import { getDate, getDaysInMonth, getWeek } from 'date-fns'
import { Progress } from '@mantine/core'
import { TransactionItem } from './_components/Transaction'
import { updateStartingBalance, updateTransaction } from './_helpers/updates'
import { amountToDollars, formattedMonth, monthNumberToMonthWord } from './_helpers/conversions'
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
                      loadStatus={statusOfData}
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
                        ).then(() => setNewAmount(''))
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <ScrollArea h={240} mt={16} type="never">
                    {
                      transactions.sort((a, b) => (b.date - a.date)).map((transaction) => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          statusOfData={statusOfData}

                          onEdit={(newVal, key) => {
                            setServerData(
                              updateTransaction({
                                _entries: data,
                                _monthId: month.id,
                                _transactionId: transaction.id,
                                _keyToUpdate: key,
                                _newVal: newVal,
                              }) as ServerDataEntries
                            )
                          }}
                          onDelete={() => {
                            setServerData(
                              deleteTransaction({
                                _entries: data,
                                _monthId: month.id,
                                _transactionId: transaction.id,
                              }) as ServerDataEntries
                            )
                          }}
                        />
                      ))
                    }
                  </ScrollArea>
                </Accordion.Panel>
              </Accordion.Item>
            )
          })
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