import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

import { router } from '../../bundle/routes_for_router'
import Provider from '../tools/components/Provider'

const div = document.getElementById('app-root')

if (
  div &&
  (router !== null)
) {
  const root = createRoot(div)
  flushSync(() => {
    root.render(
      <React.StrictMode>
        <Provider />
      </React.StrictMode>
    )
  })
} else {
  throw new Error('Could not find app-root div')
}

