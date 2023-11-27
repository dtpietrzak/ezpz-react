import * as React from 'react'
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

export type ServerResponse<T extends JSONable | unknown = unknown> = {
  data?: T,
  error?: ErrorMessage,
  status: LoadStatus,
}

export type LoadFunction<T extends JSONable | unknown = unknown> =
  () => Promise<ServerResponse<T>>

export type UpdateFunction<T extends JSONable | unknown = unknown> =
  (data?: React.SetStateAction<T>) => Promise<ServerResponse<T>>

export type ServerFunctions<T extends JSONable | unknown = unknown> = {
  loadFunction: LoadFunction<T>
  updateFunction?: UpdateFunction<T>
}

export type UseServerOptions<T extends JSONable | unknown = unknown> = {
  loadOn?: 'client' | 'server'
  serverInit?: T
  serverSyncId?: string
  serverLoadAt?: 'compile' | 'runtime'
  updateAs?: 'optimistic' | 'pessimistic' | 'client-only'
}

export type UseServerSyncOptions<T extends JSONable | unknown = unknown> = {
  syncLocalChanges?: boolean
  serverInit?: T
}

export type _LoadFunctionDataBuilder = {
  loadFunction: string
  uid: string
  loadOnServer: boolean
}

export type LoadFunctionData = {
  loadFunction: LoadFunction
  uid: string
  loadOnServer: boolean
}

export type UseServerReturn<T> = [
  T,
  (
    newState: React.SetStateAction<T>,
    shouldForceTrigger?: boolean,
  ) => void,
  (
    newState: React.SetStateAction<T>,
    shouldForceTrigger?: boolean,
  ) => (Promise<boolean>),
  LoadStatus,
  () => (Promise<boolean>),
]

export type RouteSSR = {
  name: string,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.FC<any>,
  config: PageConfig,
  loadFunctionData: LoadFunctionData[],
}

export type RouteCSR = RouteObject & {
  config: PageConfig,
}

export type LayoutSSR = {
  path: string
  layoutPaths: string[]
  layoutsHash: string
  Layouts: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Component: React.FC<any>
    loadFunctionData: LoadFunctionData[]
  }[]
}

export type LayoutCSR = {
  path: string
  layoutPaths: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Layouts: React.FC<any>[]
  layoutsHash: string
}

export type Entry<T> = [string, T]

export type ComponentType = 'page' | 'layout' | 'component' | 'unknown'


export type JSONable = string | number | boolean | null | JSONableObject | JSONableArray;

interface JSONableObject {
  [key: string]: JSONable;
}

interface JSONableArray extends Array<JSONable> { }