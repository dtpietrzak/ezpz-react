import { HTMLProps } from 'react'
import { isServer } from './ezpz-utils';

export type LoadStatus = 'init' | 'loading' | 'success' | 'error'

interface LoadHandlerProps extends HTMLProps<HTMLDivElement> {
  status: LoadStatus
  init?: JSX.Element
  loading: JSX.Element
  success: JSX.Element
  error?: JSX.Element
}

export const LoadHandler = ({
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
        isServer ?
          init ? init : loading
          :
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