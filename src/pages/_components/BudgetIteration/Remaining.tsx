import * as React from 'react'
import { FC, LoadHandler } from 'ezpz'
import { Skeleton, Text } from '@mantine/core'
import { amountToDollars } from 'src/pages/_helpers/conversions'
import EditText from '../EditText'
import { LoadStatus } from 'ezpz/types'
import { Iteration } from 'src/_types/global'

type RemainingProps = {
  remainingBalance: number
  startingBalance: Iteration['startingBalance']
  loadStatus: LoadStatus

  onUpdateBudgetTotal: (newTotal: string) => void
}

const Remaining: FC<RemainingProps> = ({
  remainingBalance,
  startingBalance,
  loadStatus,

  onUpdateBudgetTotal,
}) => {

  return (
    <LoadHandler
      status={loadStatus}
      firstLoad={
        <div className='flex w-full justify-between -mb-4'>
          <Text size='xl' fw={500} mb='lg'
            className='flex-auto flex flex-row gap-2 items-center'
            c='dimmed'
          >
            Remaining:<Skeleton height={20} w={80} radius="xl" />
          </Text>
          <Text size='xl' fw={500} mb='lg' c='dimmed'
            className='flex flex-row gap-2 items-center'
          >
            /<Skeleton height={20} w={80} radius="xl" />
          </Text>
        </div>
      }
      success={
        <div className='flex w-full justify-between -mb-4'>
          <Text size='xl' fw={500} mb='lg'
            className='flex-auto'
            c={remainingBalance < 0 ? 'red' : 'blue'}
          >
            Remaining: ${amountToDollars(remainingBalance)}
          </Text>
          <EditText size='xl' fw={500} mb='lg' c='dimmed'
            loadStatus={loadStatus}
            prefix={`/ `}
            value={amountToDollars(startingBalance)}
            onSave={(newVal) => onUpdateBudgetTotal(newVal)}
          />
        </div>
      }
    />
  )
}

export default Remaining