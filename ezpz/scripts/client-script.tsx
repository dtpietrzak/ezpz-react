import 'build/app.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/code-highlight/styles.css'
import '@mantine/tiptap/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/carousel/styles.css'
import '@mantine/spotlight/styles.css'
import '@mantine/nprogress/styles.css'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

import { router } from '../../build/routing/routes_for_csr'
import Provider from '../tools/components/ProvidersForClient'

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

