import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

import { RouterProvider } from 'react-router-dom'

import { router } from '../bundle/routes_for_router'

const div = document.getElementById('app-root')

if (
  div &&
  (router !== null)
) {
  const root = createRoot(div)
  flushSync(() => {
    root.render(
      <React.StrictMode>
        <RouterProvider router={router!} />
      </React.StrictMode>
    )
  })
  console.log('client script loaded')
} else {
  throw new Error('Could not find app-root div')
}

