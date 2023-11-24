import { ErrorMessage, LoadStatus, UseServerOptions, ServerFunctions, UseServerReturn, ComponentType } from 'ezpz/types'
import { isClient, isServer } from './ezpz-utils'
import { useState, useEffect } from './react-wrappers'
import { nprogress } from '@mantine/nprogress'


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

let init = isClient ? window.__ezpz_data__ : undefined
let initSsrComplete = false
if (isClient) {
  window.__ezpz_cache__ = new Map<string, any>()
}

const updateCache = (serverSyncId: string, data: any) => {
  window.__ezpz_cache__.set(serverSyncId, data)
}

const loadFunctionStateUpdateTrigger = (
  value: any,
  componentType: ComponentType,
  serverSyncId?: string
) => {
  if (!serverSyncId) return
  window.dispatchEvent(
    new CustomEvent('loadFunctionStateUpdated', {
      detail: {
        value: value,
        componentType: componentType,
        serverSyncId: serverSyncId,
      }
    })
  )
}

const loadFunctionStatusUpdateTrigger = (
  status: LoadStatus,
  componentType: ComponentType,
  serverSyncId?: string
) => {
  if (!serverSyncId) return
  window.dispatchEvent(
    new CustomEvent('loadFunctionStatusUpdated', {
      detail: {
        status: status,
        componentType: componentType,
        serverSyncId: serverSyncId,
      }
    })
  )
}

export const useServer = <T,>(
  initialState: T,
  {
    loadFunction, updateFunction,
  }: ServerFunctions<T>,
  {
    loadOn = 'client', serverLoadAt = 'runtime',
    updateAs = 'optimistic', serverSyncId, serverInit,
  }: UseServerOptions,
): UseServerReturn<T> => {
  let componentType: ComponentType = 'unknown'

  if (isServer) {
    if (loadOn === 'client' || !serverInit) {
      return [initialState, () => initialState, () => initialState, 'init']
    }
    return [serverInit, () => serverInit, () => serverInit, 'success']
  }

  let initFromServer = false

  if (serverSyncId) {
    // remove layout_ or page_ from serverSyncId
    // so the cache is matched across pages and layouts
    if (serverSyncId.startsWith('layout')) {
      serverSyncId = serverSyncId.substring(6)
      componentType = 'layout'
    } else if (serverSyncId.startsWith('page')) {
      serverSyncId = serverSyncId.substring(4)
      componentType = 'page'
    }
    // check if it's already been cached
    if (window.__ezpz_cache__.has(serverSyncId)) {
      // if so, override the init object for this serverSyncId
      init[serverSyncId] = window.__ezpz_cache__.get(serverSyncId)
    }
  }

  // if server has an init ID for this state
  if (serverSyncId && init?.[serverSyncId]) {
    initFromServer = true
    // override internal initial state with server state
    initialState = init[serverSyncId]
  }

  const [state, _setLocalState] = useState(initialState)

  const setLocalState = (data: React.SetStateAction<T>) => {
    if (typeof data === 'function') {
      // @ts-expect-error
      _setLocalState(data(state))
    } else {
      _setLocalState(data)
    }
    loadFunctionStateUpdateTrigger(
      data,
      componentType,
      serverSyncId,
    )
  }

  const syncLoadFunctionState = (e) => {
    if (
      e.detail.componentType === 'page' && componentType === 'layout' ||
      e.detail.componentType === 'layout' && componentType === 'page'
    ) {
      if (e.detail.serverSyncId === serverSyncId) {
        // just send it!
        _setLocalState(e.detail.value)
      }
    }
  }

  const [status, _setStatus] = useState<LoadStatus>(
    initFromServer ? 'success' : 'init'
  )

  const setStatus = (loadStatus: LoadStatus) => {
    _setStatus(loadStatus)
    loadFunctionStatusUpdateTrigger(
      loadStatus,
      componentType,
      serverSyncId,
    )
  }

  const syncLoadFunctionStatus = (e) => {
    if (
      e.detail.componentType === 'page' && componentType === 'layout' ||
      e.detail.componentType === 'layout' && componentType === 'page'
    ) {
      if (e.detail.serverSyncId === serverSyncId) {
        // just send it!
        _setStatus(e.detail.status)
      }
    }
  }

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
      if (serverSyncId) {
        updateCache(serverSyncId, data)
        loadFunctionStateUpdateTrigger(
          data,
          componentType,
          serverSyncId,
        )
      }
      setLocalState(data)
    }
    setStatus('loading')

    if (updateFunction) {
      updateFunction(data)
        .then(({ data: updatedData, status, error }) => {
          if (status === 'success' && updateAs === 'pessimistic') {
            if (serverSyncId) {
              const _data = (updatedData ?? data)
              updateCache(serverSyncId, _data)
              loadFunctionStateUpdateTrigger(
                (_data),
                componentType,
                serverSyncId,
              )
            }
            setLocalState(updatedData ?? data ?? initialState)
          }
          if (status === 'error' && updateAs === 'optimistic') {
            if (serverSyncId) window.__ezpz_cache__.set(serverSyncId, lastData)
            setLocalState(lastData)
          }
          setStatus(status)
          _error = error
        })
        .catch((error) => {
          if (serverSyncId) window.__ezpz_cache__.set(serverSyncId, lastData)
          setLocalState(lastData)
          setStatus('error')
          _error = error
        })
    }
    return _error
  }


  useEffect(() => {
    window.addEventListener(
      'loadFunctionStateUpdated', syncLoadFunctionState,
    )

    window.addEventListener(
      'loadFunctionStatusUpdated', syncLoadFunctionStatus,
    )

    return (() => {
      window.removeEventListener(
        'loadFunctionStateUpdated', syncLoadFunctionState,
      )

      window.removeEventListener(
        'loadFunctionStatusUpdated', syncLoadFunctionStatus,
      )
    })
  }, [])

  useEffect(() => {
    let ignore = false

    if (initFromServer && !initSsrComplete) {
      initSsrComplete = true
      return
    }

    if (status !== 'init') {
      setStatus('loading')
    }
    loadFunction()
      .then(({ data, status, error }) => {
        if (!ignore) {
          if (status === 'success') {
            if (serverSyncId) {
              updateCache(serverSyncId, data)
              loadFunctionStateUpdateTrigger(
                data,
                componentType,
                serverSyncId,
              )
            }
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

    return () => {
      ignore = true
    }
  }, [location.pathname])

  useEffect(() => {
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




export const useStateWithTrigger = <S = unknown>(initialState: S | (() => S)) => {
  const [state, _setState] = useState<S>(initialState)
  const [trigger, setTrigger] = useState<boolean>(false)

  const setStateWithTrigger = (
    newState: React.SetStateAction<S>,
    shouldForceTrigger: boolean = false,
  ) => {
    _setState(newState)
    if (shouldForceTrigger) setTrigger(!trigger)
  }

  return [
    state,
    setStateWithTrigger,
    trigger,
  ] as const
}