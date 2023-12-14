import * as React from 'react';
import { FC, LoadHandler, isLoading } from 'ezpz';
import { Button, TextInput } from '@mantine/core';
import { LoadStatus } from 'ezpz/types';

type addTransactionProps = {
  loadStatus: LoadStatus
  newAmount: string

  onAddNewTransaction: () => void
  onUpdateNewAmount: (newAmount: string) => void
}

const AddTransaction: FC<addTransactionProps> = ({
  loadStatus,
  newAmount,

  onAddNewTransaction,
  onUpdateNewAmount,
}) => {

  return (
    <div className='flex items-center'>
      <div className='w-12 mr-1'>New:</div>
      <TextInput
        disabled={loadStatus === 'first_load'}
        className='flex-auto'
        type='number'
        leftSection='$'
        size='md'
        value={newAmount}
        onChange={(e) => onUpdateNewAmount(e.target.value)}
      />
      <Button
        disabled={isLoading(loadStatus)}
        className='ml-2'
        onClick={() => onAddNewTransaction()}
      >
        Add
      </Button>
    </div>
  )
}

export default AddTransaction