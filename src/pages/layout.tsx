import { FC, cm, useEffect, useServer, useState } from "ezpz"
import { Text, Button, Drawer, Input } from "@mantine/core"
import { modals } from '@mantine/modals'
import { useDisclosure } from '@mantine/hooks'

const MainLayout: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const time = new Date().getTime()

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  const [value, setLocalValue, setServerValue, statusOfValue] =
    useServer<string>('', {
      loadFunction: async () => (
        (await fetch('http://localhost:3000/api')).json()
      ),
      updateFunction: async (data) => (
        (await fetch('http://localhost:3000/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: data })
        })).json()
      ),
    }, {
      loadOn: 'client',
      serverSyncId: 'page_comp',
    })

  const openModal = () => modals.openConfirmModal({
    title: 'Please confirm your action',
    children: (
      <Text size="sm">
        {time} - is the unix epoch that this layout last rendered at. - {value}
      </Text>
    ),
    labels: { confirm: 'Okay', cancel: 'Cancel' },
    onCancel: () => console.log('Cancel'),
    onConfirm: () => {
      setServerValue('thing').then((success) => console.log('Confirmed'))
    },
  })

  return (
    <div className={cm('w-full h-full bg-slate-800')}>
      <div className={cm('w-full h-12 bg-slate-700 flex justify-between items-center px-4')}>
        <div className={cm('text-white flex items-center h-12 text-2xl font-bold align-middle font-mono')}>
          ezpz - {value + '  ' + statusOfValue}
        </div>
        <div
          className={cm('text-white text-2xl font-bold align-middle cursor-pointer')}
          onClick={openModal}
        >
          {time}
        </div>
        <Button
          className={cm('text-white text-2xl font-bold align-middle')}
          onClick={openDrawer}
        >
          menu
        </Button>
      </div>
      {children}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Menu"
        size="md"
        position="right"
      >
        <Input
          value={value}
          onChange={(e) => setLocalValue(e.currentTarget.value)}
        />
      </Drawer>
    </div>
  )
}

export default MainLayout