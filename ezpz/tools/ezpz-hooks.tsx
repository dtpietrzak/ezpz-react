import {
  useState as RUseState,
  useEffect as RUseEffect,
} from 'react'
import { ErrorMessage, LoadStatus, UseServerOptions, ServerFunctions, UseServerReturn } from 'ezpz/types'
import { isClient, isServer } from './ezpz-utils'
import { nprogress } from '@mantine/nprogress'
import { useLocation } from './react-router-dom-wrappers'


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

// @ts-expect-error
let init = typeof window !== 'undefined' ? window.__initial_data__ : undefined
let initSsrComplete = false
let cache = new Map<string, any>()


export const useServer = <T,>(
  initialState: T,
  {
    loadFunction, updateFunction,
  }: ServerFunctions<T>,
  {
    loadOn = 'client', serverLoadAt = 'runtime',
    updateAs = 'optimistic', serverInitId, serverInit,
  }: UseServerOptions,
): UseServerReturn<T> => {

  if (isServer) {
    return [serverInit, () => serverInit, () => serverInit, 'success']
  }

  const location = useLocation()
  let initFromServer = false

  if (serverInitId) {
    // check if it's already been cached
    if (cache.has(serverInitId)) {
      // if so, override the init object for this serverInitId
      init[serverInitId] = cache.get(serverInitId)
    }
  }

  // if server has an init ID for this state
  if (serverInitId && init?.[serverInitId]) {
    initFromServer = true
    // override internal initial state with server state
    initialState = init[serverInitId]
  }

  const [state, setLocalState] = RUseState(initialState)

  const [status, setStatus] = RUseState<LoadStatus>(
    initFromServer ? 'success' : 'init'
  )

  let _error: ErrorMessage | undefined

  const setServerState = async (data?: React.SetStateAction<T>) => {
    if (typeof data === 'undefined') data = state
    const lastData = state

    if (updateAs === 'client-only') {
      setLocalState(data)
      setStatus('success')
      return
    }

    if (updateAs === 'optimistic') {
      if (serverInitId) cache.set(serverInitId, data)
      setLocalState(data)
    }
    setStatus('loading')

    if (updateFunction) {
      updateFunction(data)
        .then(({ data: updatedData, status, error }) => {
          if (status === 'success' && updateAs === 'pessimistic') {
            if (serverInitId) cache.set(serverInitId, (updatedData ?? data))
            setLocalState(updatedData ?? data ?? initialState)
          }
          if (status === 'error' && updateAs === 'optimistic') {
            if (serverInitId) cache.set(serverInitId, lastData)
            setLocalState(lastData)
          }
          setStatus(status)
          _error = error
        })
        .catch((error) => {
          if (serverInitId) cache.set(serverInitId, lastData)
          setLocalState(lastData)
          setStatus('error')
          _error = error
        })
    }
    return _error
  }




  RUseEffect(() => {
    let ignore = false

    if (initFromServer && !initSsrComplete) {
      initSsrComplete = true
      return
    }

    setStatus('loading')
    loadFunction()
      .then(({ data, status, error }) => {
        if (!ignore) {
          if (status === 'success') {
            if (serverInitId) cache.set(serverInitId, data)
            setLocalState(data ?? initialState)
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
  }, [location.pathname])

  RUseEffect(() => {
    if (status === 'loading') nprogress.start()
    if (status === 'success' || status === 'error') nprogress.complete()
  }, [status])

  return [
    state,
    setLocalState,
    setServerState,
    status,
  ]

}




export const useSkipServer = <T,>(hook: T, serverReturn?: any) => {
  if (isServer) return serverReturn as T
  return hook
}

export const useSkipClient = <T,>(hook: T, clientReturn?: any) => {
  if (isServer) return clientReturn as T
  return hook
}