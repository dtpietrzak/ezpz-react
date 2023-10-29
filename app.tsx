import { FC } from 'react'

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
        <title>{title ?? 'ezpz'}</title>
      </head>
      <body id="app-root">
        {children}
      </body>
      <script>console.log(__log_statement__)</script>
      <script defer src="scripts/bundle.js"/>
    </html>
  )
}

export default App