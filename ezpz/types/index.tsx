import { FC } from "react"
import { RouteObject } from "react-router-dom"

export type PageConfig = {
  title?: string
  description?: string
  keywords?: string
  author?: string
  viewport?: string
}

export type ErrorMessage = string

export type LoadStatus = 'init' | 'loading' | 'success' | 'error'

export type ServerResponse<T> = {
  data?: T,
  error?: ErrorMessage,
  status: LoadStatus,
}

export type ServerFunction<T> =
  (data?: React.SetStateAction<T>) => Promise<ServerResponse<T>>

export type ServerFunctions<T> = {
  loadFunction: ServerFunction<T>
  updateFunction?: ServerFunction<T>
}

export type UseServerOptions = {
  loadOn?: 'client' | 'server'
  serverInit?: any
  serverSyncId?: string
  serverLoadAt?: 'compile' | 'runtime'
  updateAs?: 'optimistic' | 'pessimistic' | 'client-only'
}

export type LoadFunctionData = {
  loadFunction: any
  uid: string
  loadOnServer: boolean
}

export type UseServerReturn<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  React.Dispatch<React.SetStateAction<T>> |
  ((data: React.SetStateAction<T>) => Promise<ErrorMessage | undefined>),
  LoadStatus,
]

export type RouteSSR = {
  name: string,
  path: string,
  Component: any,
  config: PageConfig,
  loadFunctionData: LoadFunctionData[],
}

export type RouteCSR = RouteObject & {
  config: PageConfig,
}

export type LayoutEntrySSR = [
  string,
  {
    path: string
    layoutPaths: string[]
    layoutsHash: string
    Layouts: {
      Component: React.FC<any>
      loadFunctionData: LoadFunctionData[]
    }[]
  }
]

export type LayoutEntryCSR = [
  string,
  {
    path: string
    layoutPaths: string[]
    Layouts: FC<any>[]
    layoutsHash: string
  }
]

export type ComponentType = 'page' | 'layout' | 'component' | 'unknown'