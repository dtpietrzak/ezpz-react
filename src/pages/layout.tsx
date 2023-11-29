import { cm, useServer, useState } from "ezpz"
import { Text, Button, Drawer, Input } from "@mantine/core"
import { modals } from '@mantine/modals'
import { useDisclosure } from '@mantine/hooks'
import { LayoutFC } from "ezpz/types"

const MainLayout: LayoutFC = ({
  children,
}) => {
  const time = new Date().getTime()
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  const [test, setTest] = useState('')

  const [value, setLocalValue, setServerValue, statusOfValue, reloadValue] =
    useServer('', {
      loadFunction: async (data) => (
        (await fetch(`http://localhost:3000/api?test=${data?.thing || 'poo'}`)).json()
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
    }, { thing: test })

  const openModal = () => modals.openConfirmModal({
    title: 'Please confirm your action',
    children: (
      <Text size="sm">
        {time} - is the unix epoch that this layout last rendered at. - {value}
      </Text>
    ),
    labels: { confirm: 'Okay', cancel: 'Cancel' },
    onCancel: () => {
      console.log('Cancel')
      reloadValue()
    },
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
          value={test}
          onChange={(e) => setTest(e.currentTarget.value)}
        />
      </Drawer>
    </div>
  )
}

export default MainLayout