import { HTMLProps, FC, Suspense } from 'react'
import { LoadStatus } from 'ezpz/types'

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
      <Suspense fallback={
        status === 'init' ?
          init ? init : loading : loading
      }>
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
      </Suspense>
    </div>
  )
}

export default LoadHandler