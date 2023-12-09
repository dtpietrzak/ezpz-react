import * as React from 'react'
import { FC } from 'ezpz'
import { Text } from '@mantine/core'
import { amountToDollars } from 'src/pages/_helpers/conversions'

type ThisWeekAnnuallyProps = {
  weeklyTotalSpent: number
  weeklyTotalSpendable: number
}

const ThisWeekAnnually: FC<ThisWeekAnnuallyProps> = ({
  weeklyTotalSpent,
  weeklyTotalSpendable,
}) => {
  return (
    <div className='flex w-full justify-between mt-2'>
      <Text size='sm' fw={500} mb='lg' c='dimmed'
        className='flex-auto'
      >
        This Week Annually: ${amountToDollars(weeklyTotalSpendable - weeklyTotalSpent)} / ${amountToDollars(weeklyTotalSpendable)}
      </Text>
    </div>
  )
}

export default ThisWeekAnnually