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
  serverInitId?: string
  serverLoadAt?: 'compile' | 'runtime'
  updateAs?: 'optimistic' | 'pessimistic' | 'client-only'
}

export type UseServerReturn<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  React.Dispatch<React.SetStateAction<T>> | 
  ((data: React.SetStateAction<T>) => Promise<ErrorMessage | undefined>),
  LoadStatus,
]

export type TempSsrRoute = {
  name: 'Index',
  path: '/',
  Component: any,
  config: PageConfig,
  loadFunctionNames: string[],
  loadFunctionUIDs: string[],
  loadFunctionsLoadOnServer: boolean[],
}

export type Route = {
  name: string
  path: string
  Component: any
  config?: PageConfig
  loadFunctions: {
    // this is the name of the value getter of the useServer hook (ex: value)
    name: string
    // this is created automatically during compilation
    uid: string
    loadOnServer: boolean
    // this is the actual load function that is called
    function: any
  }[]
}

export type RouteCSR = RouteObject & {
  config: PageConfig,
}