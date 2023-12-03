import { Meta } from 'ezpz/tools/components/Meta'
import { PageConfig } from 'ezpz/types'
import * as React from 'react'
import config from 'ezpz.config'
import { ColorSchemeScript } from '@mantine/core'
import ProvidersForServerAndClient from 'ezpz/tools/components/ProvidersForServerAndClient'

interface AppProps {
  children: React.ReactNode
  data: Record<string, unknown>
  pageConfig: PageConfig
}

const App: React.FC<AppProps> = ({
  pageConfig,
  children,
  data,
}) => {
  const title = pageConfig?.title ?? config.global_page_config?.title

  return (
    <html lang='en'>
      <head>
        <meta charSet='UTF-8' />
        {(title) ? <title>{title}</title> : null}
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
        <link href="__css_injection__" rel="stylesheet" />
        <ColorSchemeScript />
      </head>
      <body>
        <div id="app-root">
          <ProvidersForServerAndClient data={data}>
            {children}
          </ProvidersForServerAndClient>
        </div>
        __script_injection__
      </body>
    </html>
  )
}

export default App