import { HTMLProps, FC } from 'react'
import { isServer } from './ezpz-utils'
import { useEffect } from './react-wrappers'
import { useLocation } from './react-router-dom-wrappers'
import { config as ezpzConfig } from 'ezpz.config'

export type PageConfig = {
  title?: string
  description?: string
  keywords?: string
}

interface PageProps extends HTMLProps<HTMLDivElement> {
  config: PageConfig
}

export const Page: FC<PageProps> = ({
  config,
  ...props
}) => {
  const location = useLocation()

  useEffect(() => {
    document.title = config.title ?? ezpzConfig.app_name
  }, [location])

  return (
    <div {...props} />
  )
}


export type LoadStatus = 'init' | 'loading' | 'success' | 'error'

interface LoadHandlerProps extends HTMLProps<HTMLDivElement> {
  status: LoadStatus
  init?: JSX.Element
  loading: JSX.Element
  success: JSX.Element
  error?: JSX.Element
}

export const LoadHandler: FC<LoadHandlerProps> = ({
  status,
  init,
  loading,
  success,
  error,
  ...props
}: LoadHandlerProps) => {
  return (
    <div {...props}>
      {
        status === 'init' ?
          init ? init : loading
          :
          status === 'loading' ?
            loading
            :
            status === 'success' ?
              success
              :
              status === 'error' ?
                error ? error : loading
                :
                null
      }
    </div>
  )
}