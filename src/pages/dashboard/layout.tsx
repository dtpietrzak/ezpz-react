import { FC, cm, useServer } from "ezpz"

const BasicLayout: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const timestamp = new Date().getTime()

  const [value, setLocalValue, setServerValue, statusOfValue] =
    useServer<string>('', {
      loadFunction: async () => (
        (await fetch('http://localhost:3000/api/layout')).json()
      ),
      updateFunction: async (data) => (
        (await fetch('http://localhost:3000/api/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: data })
        })).json()
      ),
    }, {
      loadOn: 'client',
      serverSyncId: 'page_comp2',
    })

  return (
    <div className={cm("flex w-full h-full justify-start")}>
      <div className={cm("h-full w-64 bg-slate-700 p-4")}>
        <p>
          Dashboard Layout:
        </p>
        <p className={cm("text-2xl font-bold text-white")}>
          {timestamp} - {value + '  ' + statusOfValue}
        </p>
      </div>
      <div className={cm("p-4 flex-1")}>
        {children}
      </div>
    </div>
  )
}

export default BasicLayout