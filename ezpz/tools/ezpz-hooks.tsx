import { ErrorMessage, LoadStatus, UseServerOptions, ServerFunctions, UseServerReturn, ComponentType, UseServerSyncOptions, JSONable } from 'ezpz/types'
import { isClient, isServer } from './ezpz-utils'
import { useState, useEffect, useCallback } from './react-wrappers'
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

const loadFunctionUpdateServerTrigger = <T,>(
  value: T,
  serverSyncId: string
) => {
  if (!serverSyncId) return
  window.dispatchEvent(
    new CustomEvent('loadFunctionUpdateServer', {
      detail: {
        value: value,
        serverSyncId: serverSyncId,
      }
    })
  )
}

const loadFunctionUpdateClientTrigger = (
  serverSyncId: string
) => {
  if (!serverSyncId) return
  window.dispatchEvent(
    new CustomEvent('loadFunctionUpdateClient', {
      detail: {
        serverSyncId: serverSyncId,
      }
    })
  )
}

const promiseNotReady: Promise<false> =
  new Promise((resolve) => resolve(false))

const promiseSuccess: Promise<true> =
  new Promise((resolve) => resolve(true))

export const useServer = <T extends JSONable>(
  initialState: T,
  {
    loadFunction, updateFunction,
  }: ServerFunctions<T>,
  {
    loadOn = 'client', serverLoadAt = 'runtime',
    updateAs = 'optimistic', serverSyncId, serverInit,
  }: UseServerOptions<T>,
): UseServerReturn<T> => {
  if (isServer) {
    if (loadOn === 'client' || !serverInit) {
      return [
        initialState,
        () => { },
        () => promiseNotReady,
        'init',
        () => promiseNotReady,
      ]
    }
    return [
      serverInit,
      () => { },
      () => promiseSuccess,
      'success',
      () => promiseSuccess,
    ]
  }

  let componentType: ComponentType = 'unknown'
  let initFromServer = false
  const location = useLocation()

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
    if (window.__ezpz_cache__.has(serverSyncId) && init) {
      // if so, override the init object for this serverSyncId
      const _init = window.__ezpz_cache__.get(serverSyncId)
      if (typeof _init !== 'undefined') {
        init[serverSyncId] = _init
      }
    }
  }

  // if server has an init ID for this state
  if (serverSyncId && init?.[serverSyncId]) {
    initFromServer = true
    // override internal initial state with server state
    if (typeof init[serverSyncId] !== 'undefined') {
      initialState = init[serverSyncId]
    }
  }

  const [state, _setLocalState] = useState(initialState)

  const setLocalState = (data: React.SetStateAction<T>) => {
    if (typeof data === 'function') {
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
    if (e.detail.serverSyncId === serverSyncId) {
      // just send it!
      _setLocalState(e.detail.value)
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
    if (e.detail.serverSyncId === serverSyncId) {
      // just send it!
      _setStatus(e.detail.status)
    }
  }

  let _error: ErrorMessage | undefined

  const _loadFunction = async (ignore?: boolean) => {
    _error = undefined
    if (initFromServer && !initSsrComplete) {
      initSsrComplete = true
      return promiseSuccess
    }
    await loadFunction()
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
    if (!ignore && _error) throw new Error(_error)
    return true
  }

  const setServerState = async (data?: React.SetStateAction<T>) => {
    _error = undefined
    if (typeof data === 'undefined') data = state
    const lastData = state

    if (updateAs === 'client-only') {
      setLocalState(data)
      setStatus('success')
      return promiseSuccess
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
      await updateFunction(data)
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
    if (_error) throw new Error(_error)
    return true
  }

  const updateServerPerRequest = async (e) => {
    if (serverSyncId && e.detail.serverSyncId === serverSyncId) {
      setServerState(e.detail.value)
    }
  }

  const updateClientPerRequest = async (e) => {
    if (serverSyncId && e.detail.serverSyncId === serverSyncId) {
      setStatus('loading')
      _loadFunction()
    }
  }

  useEffect(() => {
    window.addEventListener(
      'loadFunctionStateUpdated', syncLoadFunctionState,
    )

    window.addEventListener(
      'loadFunctionStatusUpdated', syncLoadFunctionStatus,
    )

    window.addEventListener(
      'loadFunctionUpdateServer', updateServerPerRequest,
    )

    window.addEventListener(
      'loadFunctionUpdateClient', updateClientPerRequest,
    )

    return (() => {
      window.removeEventListener(
        'loadFunctionStateUpdated', syncLoadFunctionState,
      )

      window.removeEventListener(
        'loadFunctionStatusUpdated', syncLoadFunctionStatus,
      )

      window.removeEventListener(
        'loadFunctionUpdateServer', updateServerPerRequest,
      )

      window.removeEventListener(
        'loadFunctionUpdateClient', updateClientPerRequest,
      )
    })
  }, [])

  useEffect(() => {
    let ignore = false
    if (status !== 'init') setStatus('loading')
    _loadFunction(ignore).then((good) => { if (good) setStatus('success') })
    return () => {
      ignore = true
    }
  }, [location.pathname])

  useEffect(() => {
    if (status === 'loading' || status === 'init') nprogress.start()
    if (status === 'success' || status === 'error') nprogress.complete()
  }, [status])

  return [
    state,
    setLocalState,
    setServerState,
    status,
    () => _loadFunction(),
  ]
}




export const useServerSync = <T extends JSONable>(
  serverSyncId: string,
  initialState: T,
  {
    syncLocalChanges = true, serverInit,
  }: UseServerSyncOptions<T>,
): UseServerReturn<T> => {
  serverSyncId = `__dev_defined__${serverSyncId}`
  if (serverInit) initialState = serverInit
  let componentType: ComponentType = 'unknown'

  if (isClient) {
    // check if it's already been cached
    if (window.__ezpz_cache__.has(serverSyncId) && init) {
      // if so, override the init object for this serverSyncId
      init[serverSyncId] = window.__ezpz_cache__.get(serverSyncId)
    }
  }

  if (init?.[serverSyncId] && typeof init[serverSyncId] !== 'undefined') {
    // override internal initial state with server state
    initialState = init[serverSyncId]
  }

  const [state, _setLocalState] = useState<T>(initialState)
  const [status, setStatus] = useState<LoadStatus>('init')

  const setLocalState = (data: React.SetStateAction<T>) => {
    if (typeof data === 'function') {
      _setLocalState(data(state))
    } else {
      _setLocalState(data)
    }
    if (syncLocalChanges) {
      loadFunctionStateUpdateTrigger(
        data,
        componentType,
        serverSyncId,
      )
    }
  }

  const syncLoadFunctionState = (e) => {
    if (e.detail.serverSyncId === serverSyncId) {
      // just send it!
      _setLocalState(e.detail.value)
    }
  }

  const syncLoadFunctionStatus = (e) => {
    if (e.detail.serverSyncId === serverSyncId) {
      // just send it!
      setStatus(e.detail.status)
    }
  }

  const setServerState = async (data?: React.SetStateAction<T>) => {
    loadFunctionUpdateServerTrigger(data, serverSyncId)
    return false
  }

  const reloadServer = async () => {
    loadFunctionUpdateClientTrigger(serverSyncId)
    return false
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

  return [
    state,
    setLocalState,
    setServerState,
    status,
    reloadServer,
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