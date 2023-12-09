import * as React from 'react';
import { FC } from 'ezpz';
import { Button, TextInput } from '@mantine/core';

type addTransactionProps = {
  newAmount: string

  onAddNewTransaction: () => void
  onUpdateNewAmount: (newAmount: string) => void
}

const AddTransaction: FC<addTransactionProps> = ({
  newAmount,

  onAddNewTransaction,
  onUpdateNewAmount,
}) => {

  return (
    <div className='flex items-center'>
      <div className='w-12 mr-1'>New:</div>
      <TextInput
        className='flex-auto'
        type='number'
        leftSection='$'
        size='md'
        value={newAmount}
        onChange={(e) => onUpdateNewAmount(e.target.value)}
      />
      <Button
        className='ml-2'
        onClick={() => onAddNewTransaction()}
      >
        Add
      </Button>
    </div>
  )
}

export default AddTransaction