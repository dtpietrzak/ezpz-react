import { HTMLProps, FC } from 'react'
import { useEffect } from '../react-wrappers'
import { useLocation } from '../react-router-dom-wrappers'
import { config as ezpzConfig } from 'ezpz.config'
import { PageConfig } from 'ezpz/types'

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
  }, [config.title, location.pathname])

  return (
    <div {...props} />
  )
}

export default Page