import { cm, useServer, useState } from "ezpz"
import { ActionIcon, Button, Drawer, TextInput } from "@mantine/core"
import { useDisclosure } from '@mantine/hooks'
import { LayoutFC } from "ezpz/types"
import { ServerDataEntries } from "src/_types/global"
import { IconMenu2 } from '@tabler/icons-react'

const MainLayout: LayoutFC = ({
  children,
}) => {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  const [authString, setAuthString] = useState('')
  const [basAuthCount, setBadAuthCount] = useState(0)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setLocalData, setServerData, statusOfData, reloadData] =
    useServer<ServerDataEntries, { auth: string }>([], {
      loadFunction: async (data) => {
        const res = data?.auth ?
          await fetch(`/api`, { cache: 'no-cache' }) :
          await fetch(`/api?auth=${data?.auth}`, { cache: 'no-cache' });
        return res.json();
      },
      updateFunction: async (data) => ((
        await fetch(`/api`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      ).json()),
    }, {
      loadOn: 'client',
      serverSyncId: 'budget_data',
    }, {
      auth: authString,
    })

  return (
    <div className={cm('w-full h-[calc(100vh-78px)] bg-zinc-200')}>
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
      <div className='px-2'>
        {children}
      </div>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Menu"
        size="md"
        position="right"
      >
        <TextInput
          value={authString}
          onChange={(e) => setAuthString(e.currentTarget.value)}
        />
        <div className='flex justify-end mt-3 mb-20'>
          <Button onClick={() => {
            if (basAuthCount > 5) return
            const date = new Date()
            date.setFullYear(date.getFullYear() + 1)
            document.cookie = `auth=${authString}; expires=${date.toUTCString()}`
            reloadData()
            setBadAuthCount((prev) => (prev + 1))
          }}>
            Reload
          </Button>
        </div>
      </Drawer>
    </div>
  )
}

export default MainLayout