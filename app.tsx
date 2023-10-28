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
      <script src="scripts/bundle.js"></script>
    </html>
  )
}

export default App