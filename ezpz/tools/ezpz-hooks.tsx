import { ErrorMessage, LoadStatus, UseServerOptions, ServerFunctions, UseServerReturn, UseServerSyncOptions, JSONable, JSONableObject } from 'ezpz/types'
import { useContext } from 'react'
import { isClient, isServer } from './ezpz-utils'
import { useState, useEffect, useCallback, useRef } from './react-wrappers'
import { nprogress } from '@mantine/nprogress'
import { useLocation } from './react-router-dom-wrappers'
import { DataContext } from './components/DataProvider'
import isDeepEqual from 'fast-deep-equal/react'


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

const init = isClient ? window.__ezpz_data__ : undefined
let initSsrComplete = false
if (isClient) {
  window.__ezpz_cache__ = new Map<string, any>()
}

const updateCache = (serverSyncId: string, data: any) => {
  window.__ezpz_cache__.set(serverSyncId, data)
}

const loadFunctionStateUpdateTrigger = (
  value: any,
  serverSyncId?: string
) => {
  if (!serverSyncId) return
  window.dispatchEvent(
    new CustomEvent('loadFunctionStateUpdated', {
      detail: {
        value: value,
        serverSyncId: serverSyncId,
      }
    })
  )
}

const loadFunctionStatusUpdateTrigger = (
  status: LoadStatus,
  serverSyncId?: string
) => {
  if (!serverSyncId) return
  window.dispatchEvent(
    new CustomEvent('loadFunctionStatusUpdated', {
      detail: {
        status: status,
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

export const useServer = <
  T extends JSONable | unknown = unknown,
  U extends JSONableObject | undefined = undefined,
>(
  initialState: T,
  { loadFunction, updateFunction }: ServerFunctions<T, U>,
  {
    loadOn, serverLoadAt, updateAs, serverSyncId, serverInit,
  }: UseServerOptions<T>,
  serverLoadData?: U,
): UseServerReturn<T> => {
  if (!loadOn) loadOn = 'client'
  if (!serverLoadAt) serverLoadAt = 'runtime'
  if (!updateAs) updateAs = 'optimistic'

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

  let initFromServer = false
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocation()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const serverLoadDataRef = useRef(serverLoadData)

  if (!isDeepEqual(serverLoadDataRef.current, serverLoadData)) {
    serverLoadDataRef.current = serverLoadData
  }

  // if server has an init ID for this state
  if (serverSyncId && init?.[serverSyncId] && loadOn === 'server') {
    initFromServer = true
    // override internal initial state with server state
    if (typeof init[serverSyncId] !== 'undefined') {
      initialState = init[serverSyncId]
    }
  }

  if (serverSyncId) {
    // remove layout_ or page_ from serverSyncId
    // so the cache is matched across pages and layouts
    if (serverSyncId.startsWith('layout')) {
      serverSyncId = serverSyncId.substring(6)
    } else if (serverSyncId.startsWith('page')) {
      serverSyncId = serverSyncId.substring(4)
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [state, _setLocalState] = useState(initialState)

  const setLocalState = (data: React.SetStateAction<T>) => {
    if (typeof data === 'function') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _setLocalState(data(state))
    } else {
      _setLocalState(data)
    }
    loadFunctionStateUpdateTrigger(
      data,
      serverSyncId,
    )
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const syncLoadFunctionState = useCallback((e) => {
    if (e.detail.serverSyncId === serverSyncId) {
      // just send it!
      _setLocalState(e.detail.value)
    }
  }, [serverSyncId])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [status, _setStatus] = useState<LoadStatus>(
    initFromServer ? 'success' : 'init'
  )

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setStatus = useCallback((loadStatus: LoadStatus) => {
    _setStatus(loadStatus)
    loadFunctionStatusUpdateTrigger(
      loadStatus,
      serverSyncId,
    )
  }, [serverSyncId])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const syncLoadFunctionStatus = useCallback((e) => {
    if (e.detail.serverSyncId === serverSyncId) {
      // just send it!
      _setStatus(e.detail.status)
    }
  }, [serverSyncId])

  let _error: ErrorMessage | undefined

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const _loadFunction = useCallback(async (ignore?: boolean) => {
    _error = undefined
    if (initFromServer && !initSsrComplete) {
      initSsrComplete = true
      return promiseSuccess
    }
    await loadFunction(serverLoadData)
      .then(({ data, status, error }) => {
        if (!ignore) {
          if (status === 'success') {
            if (serverSyncId) {
              updateCache(serverSyncId, data)
              loadFunctionStateUpdateTrigger(
                data,
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
  }, [serverLoadDataRef.current, initFromServer])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setServerState = useCallback(async (data?: React.SetStateAction<T>) => {
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
  }, [state, updateAs, updateFunction, serverSyncId])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateServerPerRequest = useCallback(async (e) => {
    if (serverSyncId && e.detail.serverSyncId === serverSyncId) {
      setServerState(e.detail.value)
    }
  }, [serverSyncId, setServerState])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateClientPerRequest = useCallback(async (e) => {
    if (serverSyncId && e.detail.serverSyncId === serverSyncId) {
      setStatus('loading')
      _loadFunction()
    }
  }, [serverSyncId, setStatus, _loadFunction])

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
  }, [
    syncLoadFunctionState,
    syncLoadFunctionStatus,
    updateClientPerRequest,
    updateServerPerRequest,
  ])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    let ignore = false
    if (status !== 'init') setStatus('loading')
    _loadFunction(ignore).then((good) => { if (good) setStatus('success') })
    return () => {
      ignore = true
    }
    // disabled because we want changing paths to act like re-loading the hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // eslint-disable-next-line react-hooks/rules-of-hooks
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

  if (isClient) {
    // check if it's already been cached
    if (window.__ezpz_cache__.has(serverSyncId) && init) {
      // if so, override the init object for this serverSyncId
      init[serverSyncId] = window.__ezpz_cache__.get(serverSyncId)
    }
  }

  const { data } = useContext(DataContext)
  if (data?.[serverSyncId]) {
    // override internal initial state with server state
    // @ts-expect-error - this is a hack to get around the fact that
    // data[serverSyncId] is not typed as T
    initialState = data[serverSyncId]
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
        serverSyncId,
      )
    }
  }

  const syncLoadFunctionState = useCallback((e) => {
    if (e.detail.serverSyncId === serverSyncId) {
      // just send it!
      _setLocalState(e.detail.value)
    }
  }, [serverSyncId])

  const syncLoadFunctionStatus = useCallback((e: any) => {
    if (e.detail.serverSyncId === serverSyncId) {
      // just send it!
      setStatus(e.detail.status)
    }
  }, [serverSyncId])

  const setServerState = async (data?: React.SetStateAction<T>) => {
    let _data: T | undefined
    if (typeof data === 'function') {
      _data = data(state)
    } else {
      _data = data
    }
    loadFunctionUpdateServerTrigger(_data, serverSyncId)
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
  }, [syncLoadFunctionState, syncLoadFunctionStatus])

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