import * as React from 'react'
import { FC, useEffect, useState } from 'ezpz'
import EditText from './EditText'
import { amountToDollars } from '../_helpers/conversions'
import { Transaction } from 'src/_types/global'
import { LoadStatus } from 'ezpz/types'
import { ActionIcon, Text, Transition, Popover, ButtonGroup, Button } from '@mantine/core'
import { IconX } from '@tabler/icons-react'


type TransactionItemProps = {
  transaction: Transaction
  statusOfData: LoadStatus

  onEdit: (newVal: string | number, key: keyof Transaction) => void
  onDelete: () => void
}

export const TransactionItem: FC<TransactionItemProps> = ({
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
        <div style={styles} className='flex justify-between'>
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
              valueOnEdit={new Date(transaction.date).toLocaleString()}
              onSave={(newVal) => {
                onEdit(
                  new Date(newVal).getTime(),
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