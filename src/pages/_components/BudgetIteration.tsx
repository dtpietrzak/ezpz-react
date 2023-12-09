import * as React from 'react';

import { getDate, getDaysInMonth, getWeek } from 'date-fns';
import { FC, useState } from 'ezpz';
import { Iteration, Transaction } from 'src/_types/global';
import { Accordion, Button, ScrollArea, Text, TextInput } from '@mantine/core';
import { amountToDollars, monthNumberToMonthWord } from '../_helpers/conversions';
import EditText from './EditText';
import { LoadStatus } from 'ezpz/types';
import { BurnDownChart } from './BurnDownChart';
import { TransactionItem } from './Transaction';

type BudgetIterationProps = {
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

  // this needs to be accumulated
  const totalTransactionAmountPerDaysThisMonthSoFar = arrayOfDaysThisMonthSoFar.map((day) => {
    const transactionsThisDay = transactions.filter((transaction) => {
      return getDate(new Date(transaction.date)) === day
    })
    return (
      transactionsThisDay.reduce((acc, cur) => acc + cur.amount, 0)
    )
  }).map((amount, i, arr) => {
    return arr.slice(0, i + 1).reduce((acc, cur) => acc + cur, 0)
  }).map((amount) => ((iteration.startingBalance - amount) / 100))

  const numberOfDaysThisMonth = getDaysInMonth(new Date(iteration.id))

  return (
    <Accordion.Item
      key={iteration.id}
      value={iteration.id}
    >
      <Accordion.Control>
        <Text
          size='xl'
          fw={700}
        >
          {monthNumberToMonthWord(iteration.id.slice(5, 7))} - {iteration.id.slice(0, 4)}
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
            value={amountToDollars(iteration.startingBalance)}
            onSave={(newVal) => onUpdateBudgetTotal(newVal)}
          />
        </div>
        <BurnDownChart
          data={totalTransactionAmountPerDaysThisMonthSoFar}
          numOfTicks={numberOfDaysThisMonth}
          totalAmount={iteration.startingBalance / 100}
        />
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
            onChange={(e) => onUpdateNewAmount(e.target.value)}
          />
          <Button
            className='ml-2'
            onClick={() => onAddNewTransaction()}
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