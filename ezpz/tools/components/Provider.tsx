import React, { createContext, useState, useMemo, useCallback, FC } from "react"

import { RouterProvider } from 'react-router-dom'

import { router } from '../../../bundle/routes_for_router'

export const DataContext = createContext({
  data: {},
  updateData: (key: string, newData: Record<string, unknown>) => { },
})

const Provider: FC = () => {
  const [data, setData] = useState({})

  const updateData = useCallback((
    key: string,
    newData: Record<string, unknown>,
  ) => {
    setData((prevData) => ({
      ...prevData,
      [key]: newData,
    }))
  }, [])

  const dataValue = useMemo(() => ({
    data,
    updateData,
  }), [data, updateData])

  return (
    <DataContext.Provider value={dataValue}>
      <RouterProvider router={router!} />
    </DataContext.Provider>
  )
}

export default Provider