import { FC } from "react"

import { RouterProvider } from 'react-router-dom'

// @ts-ignore
import { router } from 'build/routing/routes_for_csr'
import Layouts from './Layouts'
import ProvidersForServerAndClient from "./ProvidersForServerAndClient"

// export const DataContext = createContext({
//   data: {},
//   updateData: (key: string, newData: Record<string, unknown>) => { },
// })

const ProvidersForClient: FC = () => {
  // const [data, setData] = useState({})

  // const updateData = useCallback((
  //   key: string,
  //   newData: Record<string, unknown>,
  // ) => {
  //   setData((prevData) => ({
  //     ...prevData,
  //     [key]: newData,
  //   }))
  // }, [])

  // const dataValue = useMemo(() => ({
  //   data,
  //   updateData,
  // }), [data, updateData])

  return (
    <ProvidersForServerAndClient>
      <Layouts>
        <RouterProvider router={router!} />
      </Layouts>
    </ProvidersForServerAndClient>
  )
}

export default ProvidersForClient