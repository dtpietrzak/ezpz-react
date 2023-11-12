import { createContext, useState, useMemo, useCallback, FC } from "react"

import { RouterProvider } from 'react-router-dom'

import { router, routes } from '../../../build/routing/routes_for_csr'
import Layouts from './Layouts'

// export const DataContext = createContext({
//   data: {},
//   updateData: (key: string, newData: Record<string, unknown>) => { },
// })

const Provider: FC = () => {
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
    <Layouts>
      <RouterProvider router={router!} />
    </Layouts>
  )
}

export default Provider