export type ErrorMessage = string

export type LoadStatus = 'init' | 'loading' | 'success' | 'error'

export type ServerResponse<T = unknown> = {
  data?: T,
  error?: ErrorMessage,
  status: LoadStatus,
}

export type ServerFunction<T = unknown> = 
  (data?: React.SetStateAction<T>) => Promise<ServerResponse>

export type ServerFunctions<T> = {
  loadFunction: ServerFunction<T>
  updateFunction?: ServerFunction<T>
}

export type UseServerOptions = {
  loadOn?: 'server' | 'client'
  serverLoadAt?: 'compile' | 'runtime'
  updateAs?: 'optimistic' | 'pessimistic' | 'client-only'
}
export type UseServerAsyncOptions = {
  loadOn?: 'server' | 'client'
  serverLoadAt?: 'compile' | 'runtime'
  updateAs?: 'optimistic' | 'pessimistic' | 'client-only'
  serverInit?: any
}

export type UseServerReturn<T> = [
  T,
  | React.Dispatch<React.SetStateAction<T>>
  | ((data: React.SetStateAction<T>) => Promise<ErrorMessage | undefined>),
  LoadStatus,
]