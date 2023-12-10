import { HTMLProps, FC, Suspense } from 'react'
import { LoadStatus } from 'ezpz/types'

interface LoadHandlerProps extends HTMLProps<HTMLDivElement> {
  status: LoadStatus
  first_load: JSX.Element
  loading?: JSX.Element
  success: JSX.Element
  error?: JSX.Element
}

export const LoadHandler: FC<LoadHandlerProps> = ({
  status,
  first_load,
  loading,
  success,
  error,
  ...props
}: LoadHandlerProps) => {
  return (
    <div {...props}>
      <Suspense fallback={first_load}>
        {
          status === 'first_load' ? first_load
            : status === 'loading' ? loading ? loading : success
              : status === 'success' ? success
                : status === 'error' ? error ? error : success
                  : null
        }
      </Suspense>
    </div>
  )
}

export default LoadHandler