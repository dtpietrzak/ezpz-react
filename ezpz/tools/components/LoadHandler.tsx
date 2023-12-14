import { HTMLProps, FC, Suspense } from 'react'
import { LoadStatus } from 'ezpz/types'
import { useServerSync } from 'ezpz'

type LoadHandlerProps = HTMLProps<HTMLDivElement> & (
  LoadHandlerManualStatusProps | LoadHandlerServerSyncProps
)

type LoadHandlerManualStatusProps = {
  status: LoadStatus
  serverSyncId?: never
  firstLoad: JSX.Element
  localLoad?: JSX.Element
  loading?: JSX.Element
  success: JSX.Element
  error?: JSX.Element
}

type LoadHandlerServerSyncProps = {
  status?: never
  serverSyncId: string
  firstLoad: JSX.Element
  localLoad?: JSX.Element
  loading?: JSX.Element
  success: JSX.Element
  error?: JSX.Element
}

export const LoadHandler: FC<LoadHandlerProps> = ({
  status,
  serverSyncId,
  firstLoad,
  localLoad,
  loading,
  success,
  error,
  ...props
}: LoadHandlerProps) => {

  if (serverSyncId) return (
    <_LoadHandlerServerSync
      status={undefined}
      serverSyncId={serverSyncId}
      firstLoad={firstLoad}
      localLoad={localLoad}
      loading={loading}
      success={success}
      error={error}
      {...props}
    />
  )

  if (status) return (
    <_LoadHandlerManualStatus 
      status={status}
      firstLoad={firstLoad}
      localLoad={localLoad}
      loading={loading}
      success={success}
      error={error}
      {...props}
    />
  )

  return null
}



export const _LoadHandlerManualStatus: FC<LoadHandlerManualStatusProps> = ({
  status,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  serverSyncId,
  firstLoad,
  localLoad,
  loading,
  success,
  error,
  ...props
}: LoadHandlerProps) => {

  return (
    <div {...props}>
      <Suspense fallback={firstLoad}>
        {
          status === 'first_load' ? firstLoad
            : status === 'local_load' ? localLoad ? localLoad : success
              : status === 'loading' ? loading ? loading : success
                : status === 'success' ? success
                  : status === 'error' ? error ? error : success
                    : null
        }
      </Suspense>
    </div>
  )
}

// DO NOT USE THIS COMPONENT DIRECTLY!!!
export const _LoadHandlerServerSync: FC<LoadHandlerServerSyncProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  status,
  serverSyncId,
  ...props
}: LoadHandlerProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, __, ___, statusOfData] = useServerSync(serverSyncId!, [], {})

  return (
    <_LoadHandlerManualStatus
      {...props}
      status={statusOfData}
    />
  )
}

export default LoadHandler