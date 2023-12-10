import * as React from 'react'
import { Accordion, Text } from '@mantine/core'
import { monthNumberToMonthWord } from 'src/pages/_helpers/conversions'
import { Iteration } from 'src/_types/global'
import { FC, cm } from 'ezpz'

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
  )
}