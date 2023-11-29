import { FC } from "react"

import { BrowserRouter, Route, Routes } from 'react-router-dom'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { routes } from 'build/routing/routes_for_csr'
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
    <BrowserRouter>
      <ProvidersForServerAndClient>
        <Layouts>
          <Routes>
            {routes.map((route) => {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  Component={route.Component}
                />
              )
            })}
          </Routes>
        </Layouts>
      </ProvidersForServerAndClient>
    </BrowserRouter>
  )
}

export default ProvidersForClient