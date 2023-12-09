import * as React from 'react';
import { FC } from 'ezpz';
import { Button, TextInput, Divider } from '@mantine/core';

type MenuProps = {
  uniqueBudgetIds: string[]
  authString: string
  newUniqueBudgetId: string
  badAuthCount: number

  onUpdateAuthString: (newAuthString: string) => void
  onUpdateNewUniqueBudgetId: (newUniqueBudgetId: string) => void
  onIncrementBadAuthCount: () => void
  onReloadData: () => void
  onAddNewBudget: () => void
  onDeleteUniqueBudget: (id: string) => void
}

const Menu: FC<MenuProps> = ({
  uniqueBudgetIds,
  authString,
  newUniqueBudgetId,
  badAuthCount,

  onUpdateAuthString,
  onUpdateNewUniqueBudgetId,
  onIncrementBadAuthCount,
  onReloadData,
  onAddNewBudget,
  onDeleteUniqueBudget,
}) => {

  return (
    <div className='flex flex-col gap-5'>
      <h1 className='text-2xl font-bold mb-0'>Initialize</h1>
      <div className='flex flex-row justify-between gap-3'>
        <TextInput
          className='flex-auto'
          value={authString}
          onChange={(e) => onUpdateAuthString(e.currentTarget.value)}
        />
        <Button
          onClick={() => {
            if (badAuthCount > 5) return
            const date = new Date()
            date.setFullYear(date.getFullYear() + 1)
            document.cookie =
              `auth=${authString}; expires=${date.toUTCString()}`
            onReloadData()
            onIncrementBadAuthCount()
          }}
        >
          Reload
        </Button>
      </div>
      <Divider />
      <h1 className='text-2xl font-bold mb-0'>Add Unique Budget</h1>
      <div className='flex flex-row justify-between gap-3'>
        <TextInput
          placeholder='Unique Budget Name'
          className='flex-auto'
          value={newUniqueBudgetId}
          onChange={(e) => onUpdateNewUniqueBudgetId(e.currentTarget.value)}
        />
        <Button
          onClick={() => onAddNewBudget()}
        >
          Add
        </Button>
      </div>
      {
        uniqueBudgetIds.map((id) => (
          <div key={id} className='flex flex-row justify-between gap-3'>
            <p className='flex-auto'>{id}</p>
            <Button bg='red' onClick={() => onDeleteUniqueBudget(id)}>
              Delete
            </Button>
          </div>
        ))
      }
    </div>
  )
}

export default Menu