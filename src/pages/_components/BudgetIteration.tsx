import * as React from 'react';

import { getDate, getDaysInMonth, getWeek } from 'date-fns';
import { FC, LoadHandler } from 'ezpz';
import { Iteration, Transaction } from 'src/_types/global';
import { Accordion, Progress, ScrollArea, Skeleton } from '@mantine/core';
import { LoadStatus } from 'ezpz/types';
import { BurnDownChart } from './BurnDownChart';
import { TransactionItem } from './Transaction';
import { Title } from './BudgetIteration/Title';
import Remaining from './BudgetIteration/Remaining';
import ThisWeekAnnually from './BudgetIteration/ThisWeekAnnually';
import AddTransaction from './BudgetIteration/AddTransaction';
import { monthIdToDate } from '../_helpers/conversions';

type BudgetIterationProps = {
  isSelected: boolean
  newAmount: string
  iteration: Iteration
  transactions: Transaction[]
  statusOfData: LoadStatus

  onAddNewTransaction: () => void
  onUpdateNewAmount: (newAmount: string) => void
  onUpdateBudgetTotal: (newTotal: string) => void
  onUpdateTransaction: (
    transactionId: string, newVal: string | number, key: keyof Transaction
  ) => void
  onDeleteTransaction: (transactionId: string) => void
}

const BudgetIteration: FC<BudgetIterationProps> = ({
  isSelected,
  newAmount,
  iteration,
  transactions,
  statusOfData,

  onAddNewTransaction,
  onUpdateNewAmount,
  onUpdateBudgetTotal,
  onUpdateTransaction,
  onDeleteTransaction,
}) => {

  const spent = transactions.reduce((acc, cur) => acc + cur.amount, 0)
  const remainingBalance = iteration.startingBalance - spent

  const dollarsBurnedPercent = (
    spent === 0 || iteration.startingBalance === 0
  ) ? 0 : (spent / iteration.startingBalance) * 100

  const yearlyTotalSpendable = iteration.startingBalance * 12
  const weeklyTotalSpendable = yearlyTotalSpendable / 52
  const transactionsThisWeek = transactions.filter((transaction) => {
    const currentWeekOfYear = getWeek(new Date())
    const transactionWeekOfYear = getWeek(new Date(transaction.date))
    return currentWeekOfYear === transactionWeekOfYear
  })

  const weeklyTotalSpent = transactionsThisWeek.reduce((acc, cur) => acc + cur.amount, 0)

  const arrayOfDaysThisMonthSoFar = Array.from(
    { length: getDaysInMonth(new Date()) },
    (_, i) => (i + 1),
  ).filter((day) => day <= getDate(new Date()))

  const totalTransactionAmountPerDaysThisMonthSoFar = arrayOfDaysThisMonthSoFar.map((day) => {
    const transactionsThisDay = transactions.filter((transaction) => {
      return getDate(new Date(transaction.date)) === day
    })
    return (
      transactionsThisDay.reduce((acc, cur) => acc + cur.amount, 0) / 100
    )
  })

  const numberOfDaysThisMonth = getDaysInMonth(monthIdToDate(iteration.id))

  return (
    <Accordion.Item value={iteration.id}>
      <Title
        isSelected={isSelected}
        iterationId={iteration.id}
        iterationType={iteration.type}
      />
      <Accordion.Panel className='max-h-60vh'>
        <Remaining
          loadStatus={statusOfData}
          remainingBalance={remainingBalance}
          startingBalance={iteration.startingBalance}

          onUpdateBudgetTotal={onUpdateBudgetTotal}
        />
        {
          iteration.type === 'month' &&
          <>
            <BurnDownChart
              loadStatus={statusOfData}
              data={totalTransactionAmountPerDaysThisMonthSoFar}
              numOfTicks={numberOfDaysThisMonth}
              totalAmount={iteration.startingBalance / 100}
            />
            <ThisWeekAnnually
              loadStatus={statusOfData}
              weeklyTotalSpent={weeklyTotalSpent}
              weeklyTotalSpendable={weeklyTotalSpendable}
            />
          </>
        }
        {
          (iteration.type === 'unique' && iteration.startingBalance !== 0) &&
          <div className='mb-3'>
            <Progress.Root size="xl">
              <Progress.Section
                value={dollarsBurnedPercent}
                color={dollarsBurnedPercent < 100 ? 'black' : 'red'}
              >
                <Progress.Label>
                  {
                    dollarsBurnedPercent > 25 ?
                      `${dollarsBurnedPercent.toFixed(0)}% - ${dollarsBurnedPercent < 100 ?
                        'Spent' : 'Over Spent'}`
                      :
                      dollarsBurnedPercent > 10 ?
                        `${dollarsBurnedPercent.toFixed(0)}%`
                        :
                        ''
                  }
                </Progress.Label>
              </Progress.Section>
              {
                dollarsBurnedPercent < 100 &&
                <Progress.Section
                  value={100 - dollarsBurnedPercent}
                  color='green'
                >
                  <Progress.Label>
                    {dollarsBurnedPercent > 80 ? '' : 'Remaining'}
                  </Progress.Label>
                </Progress.Section>
              }
            </Progress.Root>
          </div>
        }
        <AddTransaction
          loadStatus={statusOfData}
          newAmount={newAmount}

          onAddNewTransaction={onAddNewTransaction}
          onUpdateNewAmount={onUpdateNewAmount}
        />
        <ScrollArea h={240} mt={16} type="never"
          className='overflow-x-hidden border border-solid border-zinc-300 bg-zinc-100 rounded-md pr-2'
        >
          {
            transactions.sort((a, b) => (b.date - a.date)).map((transaction, i) => (
              <TransactionItem
                key={transaction.id}
                i={i}
                transaction={transaction}
                statusOfData={statusOfData}

                onEdit={(newVal, key) => onUpdateTransaction(
                  transaction.id, newVal, key
                )}
                onDelete={() => onDeleteTransaction(transaction.id)}
              />
            ))
          }
        </ScrollArea>
      </Accordion.Panel>
    </Accordion.Item>
  )
}

export default BudgetIteration