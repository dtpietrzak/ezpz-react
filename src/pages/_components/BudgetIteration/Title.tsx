import * as React from 'react'
import { Accordion, Text } from '@mantine/core'
import { monthNumberToMonthWord } from 'src/pages/_helpers/conversions'
import { Iteration } from 'src/_types/global'
import { FC } from 'ezpz'

type TitleProps = {
  iterationId: Iteration['id']
  iterationType: Iteration['type']
}

export const Title: FC<TitleProps> = ({
  iterationId,
  iterationType,
}) => {
  return (
    <Accordion.Control>
      <Text
        size='xl'
        fw={700}
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