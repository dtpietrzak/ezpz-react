import React, { FC } from 'react'

interface AppProps {
  title?: string
  children?: React.ReactNode
}

const App: FC<AppProps> = ({
  title,
  children,
}) => {
  return (
    <html>
      <head>
        <title>{title ?? ''}</title>
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