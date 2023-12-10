import * as React from 'react'
import { FC } from 'ezpz'
import { Text } from '@mantine/core'
import { amountToDollars } from 'src/pages/_helpers/conversions'
import EditText from '../EditText'
import { LoadStatus } from 'ezpz/types'
import { Iteration } from 'src/_types/global'

type RemainingProps = {
  remainingBalance: number
  startingBalance: Iteration['startingBalance']
  statusOfData: LoadStatus

  onUpdateBudgetTotal: (newTotal: string) => void
}

const Remaining: FC<RemainingProps> = ({
  remainingBalance,
  startingBalance,
  statusOfData,

  onUpdateBudgetTotal,
}) => {

  return (
    <div className='flex w-full justify-between -mb-4'>
      <Text size='xl' fw={500} mb='lg'
        className='flex-auto'
        c={remainingBalance < 0 ? 'red' : 'blue'}
      >
        Remaining: ${amountToDollars(remainingBalance)}
      </Text>
      <EditText size='xl' fw={500} mb='lg' c='dimmed'
        loadStatus={statusOfData}
        prefix={`/ `}
        value={amountToDollars(startingBalance)}
        onSave={(newVal) => onUpdateBudgetTotal(newVal)}
      />
    </div>
  )
}

export default Remaining