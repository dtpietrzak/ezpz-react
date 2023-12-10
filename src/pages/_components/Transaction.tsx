import * as React from 'react'
import { FC, cm, useEffect, useState } from 'ezpz'
import EditText from './EditText'
import { amountToDollars } from '../_helpers/conversions'
import { Transaction } from 'src/_types/global'
import { LoadStatus } from 'ezpz/types'
import { ActionIcon, Text, Transition, Popover, Button } from '@mantine/core'
import { IconX } from '@tabler/icons-react'


type TransactionItemProps = {
  i: number
  transaction: Transaction
  statusOfData: LoadStatus

  onEdit: (newVal: string | number, key: keyof Transaction) => void
  onDelete: () => void
}

export const TransactionItem: FC<TransactionItemProps> = ({
  i,
  transaction,
  statusOfData,

  onEdit,
  onDelete,
}) => {
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Transition
      mounted={mounted}
      transition="fade"
      duration={1000}
      timingFunction="ease"
    >
      {(styles) => (
        <div style={styles} className={cm(
          'flex justify-between',
          i === 0 && 'mt-4',
        )}>
          <div className='flex'>
            <div className='flex w-20 justify-end mr-2 text-right font-mono'>
              <EditText size='md' fw={500} mb='lg'
                loadStatus={statusOfData}
                prefix='$ '
                value={amountToDollars(transaction.amount)}
                onSave={(newVal) => onEdit(newVal, 'amount')}
              />
            </div>
            <div className='flex-auto max-w-[190px]'>
              <EditText size='sm' fw={500} mb='lg' c='dimmed'
                loadStatus={statusOfData}
                prefix='- '
                value={transaction.description}
                onSave={(newVal) => onEdit(newVal, 'description')}
              />
            </div>
          </div>
          <div className='flex w-18 flex-row gap-3'>
            <EditText size='sm' fw={500} mb='lg' c='dimmed'
              loadStatus={statusOfData}
              value={new Date(transaction.date).toLocaleDateString().split('/').slice(0, 2).join('/')}
              onSave={(newVal) => {
                const earlyReturn = () => {
                  onEdit(
                    transaction.date,
                    'date',
                  )
                }

                // make sure newVal only has numbers and slashes
                newVal = newVal.replace(/[^0-9/]/g, '')
                const newValSplit = newVal.split('/')
                if (newValSplit.length !== 2) return earlyReturn()

                const date = new Date(transaction.date)
                const month = parseInt(newValSplit[0])
                const day = parseInt(newValSplit[1])
                if (!month || !day) return
                if (month > 12 || month < 1) return earlyReturn()
                if (day > 31 || day < 1) return earlyReturn()
                date.setMonth(month - 1)
                date.setDate(day)

                // if the date is invalid, don't save
                if (isNaN(date.getTime())) return earlyReturn()

                onEdit(
                  date.getTime(),
                  'date',
                )
              }}
            />
            <Popover width={180} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <ActionIcon
                  variant='link'
                  size='xs'
                  bg='transparent'
                >
                  <IconX color='gray' />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <div className='flex w-full h-full justify-center items-center'>
                  <Text size="sm">Are you sure???</Text>
                  <Button
                    variant='link'
                    size='sm'
                    bg='red'
                    onClick={() => onDelete()}
                  >
                    <Text>Delete</Text>
                  </Button>
                </div>
              </Popover.Dropdown>
            </Popover>
          </div>
        </div>
      )}
    </Transition>
  )
}