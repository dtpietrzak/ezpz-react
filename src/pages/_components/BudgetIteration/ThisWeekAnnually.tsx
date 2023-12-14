import * as React from 'react'
import { FC, LoadHandler } from 'ezpz'
import { Skeleton, Text } from '@mantine/core'
import { amountToDollars } from 'src/pages/_helpers/conversions'
import { LoadStatus } from 'ezpz/types'

type ThisWeekAnnuallyProps = {
  weeklyTotalSpent: number
  weeklyTotalSpendable: number
  loadStatus: LoadStatus
}

const ThisWeekAnnually: FC<ThisWeekAnnuallyProps> = ({
  weeklyTotalSpent,
  weeklyTotalSpendable,
  loadStatus,
}) => {
  return (
    <LoadHandler
      status={loadStatus}
      firstLoad={
        <div className='flex w-full justify-between mt-2'>
          <Text size='sm' fw={500} mb='lg' c='dimmed'
            className='flex-auto flex flex-row gap-2 items-center'
          >
            This Week Annually:<Skeleton height={10} w={80} radius="xl" />
          </Text>
        </div>
      }
      success={
        <div className='flex w-full justify-between mt-2'>
          <Text size='sm' fw={500} mb='lg' c='dimmed'
            className='flex-auto'
          >
            This Week Annually: ${amountToDollars(weeklyTotalSpendable - weeklyTotalSpent)} / ${amountToDollars(weeklyTotalSpendable)}
          </Text>
        </div>
      }
    />
  )
}

export default ThisWeekAnnually