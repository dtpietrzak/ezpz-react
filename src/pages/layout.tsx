import { cm, useServer, useState } from "ezpz"
import { ActionIcon, Drawer } from "@mantine/core"
import { useDisclosure } from '@mantine/hooks'
import { LayoutFC } from "ezpz/types"
import { Budget, ServerDataEntries, ServerDataEntry } from "src/_types/global"
import { IconMenu2 } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import Menu from "./_components/Menu"

const MainLayout: LayoutFC = ({
  children,
}) => {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  const [authString, setAuthString] = useState('')
  const [newUniqueBudgetId, setNewUniqueBudgetId] = useState('')
  const [badAuthCount, setBadAuthCount] = useState(0)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setLocalData, setServerData, statusOfData, reloadData] =
    useServer<ServerDataEntries, { auth: string }>([], {
      loadFunction: async (data) => {
        const res = data?.auth ?
          await fetch(`/api`, { cache: 'no-cache' }) :
          await fetch(`/api?auth=${data?.auth}`, { cache: 'no-cache' });
        return res.json();
      },
      updateFunction: async (data) => {
        try {
          const res = await fetch(`/api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          if (res?.ok) {
            notifications.show({
              title: 'Saved!',
              message: '',
              color: 'green',
            })
          } else {
            notifications.show({
              title: 'Error',
              message: 'There was an error saving your data: L01',
              color: 'red',
              autoClose: 3000,
            })
          }
          return res.json()
        } catch (err) {
          console.error(err)
          notifications.show({
            title: 'Error',
            message: 'There was an error saving your data: L02',
            color: 'red',
            autoClose: 3000,
          })
        }
      },
    }, {
      loadOn: 'client',
      serverSyncId: 'budget_data',
    }, {
      auth: authString,
    })

  const uniqueBudgetIds = data.map((entry) => {
    if (entry[1].iteration.type === 'unique') return entry[0]
    return ''
  }).filter(Boolean)

  return (
    <div className={cm('w-full h-[calc(100dvh)] bg-zinc-200')}>
      <div className={cm('w-full h-12 bg-zinc-700 flex justify-between items-center px-4')}>
        <div className={cm('text-white flex items-center h-12 text-2xl font-bold align-middle font-mono')}>
          ez spend
        </div>
        <div
          className={cm('text-white text-2xl font-bold align-middle cursor-pointer')}
        >
        </div>
        <ActionIcon
          size='lg'
          className={cm('text-white text-2xl font-bold align-middle')}
          onClick={openDrawer}
        >
          <IconMenu2 />
        </ActionIcon>
      </div>
      <div className='px-2 overflow-y-scroll overflow-x-hidden'>
        {children}
      </div>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="md"
        position="right"
      >
        <Menu
          uniqueBudgetIds={uniqueBudgetIds}
          authString={authString}
          newUniqueBudgetId={newUniqueBudgetId}
          badAuthCount={badAuthCount}

          onUpdateAuthString={(newAuthString) => setAuthString(newAuthString)}
          onUpdateNewUniqueBudgetId={(newUniqueBudgetId) => setNewUniqueBudgetId(newUniqueBudgetId)}
          onIncrementBadAuthCount={() => setBadAuthCount((prev) => (prev + 1))}
          onReloadData={() => reloadData()}
          onAddNewBudget={() => {
            if (!newUniqueBudgetId) return
            for (const entry of data) {
              if (entry[0] === newUniqueBudgetId) {
                notifications.show({
                  title: '',
                  message: 'A budget with that name already exists!',
                  color: 'red',
                  autoClose: 2000,
                })
                return
              }
            }
            const newBudget: Budget = {
              iteration: {
                id: newUniqueBudgetId,
                startingBalance: 0,
                type: 'unique',
              },
              transactions: [],
            }
            const newEntries = [
              [newUniqueBudgetId, newBudget] as ServerDataEntry,
              ...data,
            ]
            setServerData(newEntries)
            setNewUniqueBudgetId('')
          }}
          onDeleteUniqueBudget={(id) => {
            const newEntries = data.filter((entry) => entry[0] !== id)
            setServerData(newEntries)
          }}
        />
      </Drawer>
    </div>
  )
}

export default MainLayout