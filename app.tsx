import { Meta } from 'ezpz/tools/components/Meta'
import { PageConfig } from 'ezpz/types'
import React, { FC } from 'react'
import config from 'ezpz.config'

interface AppProps {
  pageConfig?: PageConfig
  children?: React.ReactNode
}

const App: FC<AppProps> = ({
  pageConfig,
  children,
}) => {
  const title = pageConfig?.title ?? config.global_page_config?.title

  return (
    <html>
      <head>
        { (title) ? <title>{title}</title> : null }
        <Meta name='description'
          pageValue={pageConfig?.description}
          globalValue={config.global_page_config?.description}
        />
        <Meta name='keywords'
          pageValue={pageConfig?.keywords}
          globalValue={config.global_page_config?.keywords}
        />
        <Meta name='author'
          pageValue={pageConfig?.author}
          globalValue={config.global_page_config?.author}
        />
        <Meta name='viewport'
          pageValue={pageConfig?.viewport}
          globalValue={config.global_page_config?.viewport}
        />
        <script>__script_injection__</script>
      </head>
      <body>
        <div id="app-root">
          {children}
        </div>
      </body>
    </html>
  )
}

export default App