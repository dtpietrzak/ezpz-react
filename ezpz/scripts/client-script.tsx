declare global {
  interface Window {
    $RefreshReg$: any;
    $RefreshSig$: any;
    $RefreshRuntime$: any;
  }
}

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  const runtime = require('react-refresh/runtime');
  runtime.injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => type => type;
}

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

import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

import { router } from '../../build/routing/routes_for_csr'
import Provider from '../tools/components/ProvidersForClient'

const div = document.getElementById('app-root')
let root: null | ReturnType<typeof createRoot> = null

if (
  div &&
  (router !== null)
) {
  if (!root) root = createRoot(div)
  root.render(
    <React.StrictMode>
      <Provider />
    </React.StrictMode>
  )
} else {
  throw new Error('Could not find app-root div')
}

