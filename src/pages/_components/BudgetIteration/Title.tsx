import * as React from 'react'
import { Accordion, Skeleton, Text } from '@mantine/core'
import { monthNumberToMonthWord } from 'src/pages/_helpers/conversions'
import { Iteration } from 'src/_types/global'
import { FC, LoadHandler, cm } from 'ezpz'

type TitleProps = {
  isSelected: boolean
  iterationId: Iteration['id']
  iterationType: Iteration['type']
}

export const Title: FC<TitleProps> = ({
  isSelected,
  iterationId,
  iterationType,
}) => {
  return (
    <LoadHandler
      serverSyncId='budget_data'
      firstLoad={
        <Accordion.Control h={57}>
          <Skeleton height={20} w={180} radius="xl" />
        </Accordion.Control>
      }
      success={
        <Accordion.Control
          classNames={{
            control: cm(isSelected ? '!bg-gray-100' : 'transparent')
          }}
        >
          <Text
            size='xl'
            fw={700}
            c={isSelected ? 'black' : 'dimmed'}
          >
            {
              iterationType === 'month' ?
                `${monthNumberToMonthWord(iterationId.slice(5, 7))} - ${iterationId.slice(0, 4)}`
                :
                iterationId
            }
          </Text>
        </Accordion.Control>
      }
    />
  )
}
