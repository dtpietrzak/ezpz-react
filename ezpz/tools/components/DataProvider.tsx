import { FC, createContext } from "react"

export const DataContext = createContext({
  data: {} as Record<string, unknown>,
})

type DataProviderProps = {
  children: React.ReactNode
  data: Record<string, unknown>
}

export const DataProvider: FC<DataProviderProps> = ({ children, data }) => {
  return (
    <DataContext.Provider value={{ data }}>
      {children}
    </DataContext.Provider>
  )
}