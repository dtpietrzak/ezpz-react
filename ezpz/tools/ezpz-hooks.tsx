import { useState as RUseState, useEffect as RUseEffect } from 'react'

import { LoadStatus } from './ezpz-components'
import { isClient, isServer } from './ezpz-utils'
import { useState } from './react-wrappers'

export type ErrorMessage = string

export type ServerFunction<T> = (data?: React.SetStateAction<T>) => Promise<{
  data?: T,
  error?: ErrorMessage,
  status: LoadStatus,
}>

// render options
// 
// --- location ---
// server: only runs on the server (this can be compile time or runtime)
// client: only runs on the client
// both: runs on both the server (compile time or runtime) and the client
// 
// --- serverRenderTime --- (only applies to server render)
// compile: runs at compile time, is cached, and served statically
//   - this takes less processing power, but is not dynamic
// runtime: runs at runtime, is not cached, and served dynamically
//   - this takes more processing power, but is dynamic
// 
//     (even if you choose server location and compile time, the state will
//     still act as a react useState hook, and will be dynamic on the client
//     allowing you to use the setState to update the state on the client and
//     simultaneously update the state on the server. useState will always
//     work this way, regardless of these settings.
// 



export const useServer = <T,>(
  initialState: T,
  {
    loadFunction,
    updateFunction,
  }: {
    loadFunction: ServerFunction<T>
    updateFunction?: ServerFunction<T>
  },
  {
    loadOn = 'client',
    serverLoadAt = 'runtime',
    updateAs = 'optimistic',
  }: {
    loadOn?: 'server' | 'client' | 'both'
    serverLoadAt?: 'compile' | 'runtime'
    updateAs?: 'optimistic' | 'pessimistic' | 'client-only'
  }
): [
    T,
    | React.Dispatch<React.SetStateAction<T>>
    | ((data: React.SetStateAction<T>) => Promise<ErrorMessage | undefined>),
    LoadStatus,
  ] => {

  if (isClient && (loadOn !== 'server')) {
    // client - runtime
    const [state, setState] = RUseState(initialState)
    const [status, setStatus] = RUseState<LoadStatus>('init')

    let _error: ErrorMessage | undefined

    RUseEffect(() => {
      let ignore = false

      setStatus('loading')
      loadFunction()
        .then(({ data, status, error }) => {
          if (!ignore) {
            if (status === 'success') {
              setState(data ?? initialState)
            }
            setStatus(status)
            _error = error
          }
        })
        .catch((error) => {
          if (!ignore) {
            setStatus('error')
            _error = error
          }
        })

      return () => { ignore = true }
    }, [])

    const updateState = async (data: React.SetStateAction<T>) => {
      if (updateAs === 'client-only') {
        setState(data)
        setStatus('success')
        return
      }

      if (updateAs === 'optimistic') setState(data)
      setStatus('loading')

      if (updateFunction) {
        updateFunction(data)
          .then(({ data: updatedData, status, error }) => {
            if (status === 'success' && updateAs === 'pessimistic') {
              setState(updatedData ?? data)
            }
            if (status === 'error' && updateAs === 'optimistic') {
              setState(initialState)
            }
            setStatus(status)
            _error = error
          })
          .catch((error) => {
            setStatus('error')
            _error = error
          })
      }
      return _error
    }

    return [
      state,
      updateState,
      status,
    ]
  }

  return [initialState, () => initialState, 'success']
}

export const useServerAsync = async <T,>(
  initialState: T,
  {
    loadFunction,
    updateFunction,
  }: {
    loadFunction: ServerFunction<T>
    updateFunction?: ServerFunction<T>
  },
  {
    loadOn = 'both',
    serverLoadAt = 'runtime',
    updateAs = 'optimistic',
  }: {
    loadOn?: 'server' | 'client' | 'both'
    serverLoadAt?: 'compile' | 'runtime'
    updateAs?: 'optimistic' | 'pessimistic' | 'client-only'
  }
): Promise<[
  T,
  | React.Dispatch<React.SetStateAction<T>>
  | ((data: React.SetStateAction<T>) => Promise<ErrorMessage | undefined>),
  LoadStatus,
]> => {

  if (isServer && (loadOn !== 'client')) {
    if (serverLoadAt === 'compile') {
      // server - compile

      // TODO: compile time server render

      return [
        initialState,
        () => initialState,
        'success',
      ]
    } else {
      // server - runtime

      const { data, status, error } = await loadFunction()

      return [data ?? initialState, () => initialState, status]
    }
  } else if (isClient && (loadOn !== 'server')) {
    // client - runtime
  }

  return [initialState, () => initialState, 'success']
}