import { LoadStatus } from 'ezpz/ezpz-components'
import { isClient, isServer } from './ezpz-utils'
import { server } from 'src/pages'
import { useState } from 'ezpz/react-wrappers'

export type ServerFunction<T> = (data?: T) => Promise<{
  data?: T,
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

export const useServer: <T>(
  initialState: (T | (() => T)),
  settings: {
    loadFunction: ServerFunction<T>
    updateFunction?: ServerFunction<T>
    optimisticUpdate?: boolean
    renderOptions?: {
      location?: 'server' | 'client' | 'both'
      serverRenderTime?: 'compile' | 'runtime'
    }
  },
) => [(T | (() => T)), React.Dispatch<React.SetStateAction<T>>, LoadStatus] = (
  initialState,
  {
    renderOptions = {
      location: 'both',
      serverRenderTime: 'runtime',
    },
    loadFunction,
    updateFunction,
    optimisticUpdate = true,
  },
) => {
    if (isServer && (renderOptions.location !== 'client')) {
      if (renderOptions.serverRenderTime === 'runtime') {
        console.log('on server (runtime): ', initialState)

        return [initialState, () => initialState, 'success']
      } else {
        console.log('on server (compile): ', initialState)

        return [initialState, () => initialState, 'success']
      }
    } else if (isClient && (renderOptions.location !== 'server')) {
      console.log('on client: ', initialState)

      const [state, setState] = useState(initialState)
      return [state, setState, 'success']
    }

    return [initialState, () => initialState, 'success']
  }

