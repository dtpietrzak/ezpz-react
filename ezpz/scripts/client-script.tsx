import * as React from 'react'
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  import('react-refresh').then(({ default: runtime }) => {
    runtime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => { };
    window.$RefreshSig$ = () => type => type;
  })
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

import { createRoot } from 'react-dom/client'

import { router } from '../../build/routing/routes_for_csr'
import ProvidersForClient from '../tools/components/ProvidersForClient'
import { MantineProvider, MantineTheme, Progress } from '@mantine/core';

let root: null | ReturnType<typeof createRoot> = null
const theme: Partial<MantineTheme> = {
  respectReducedMotion: false,
  components: {
    Progress: Progress.extend({
      styles: {
        root: {
          border: '1px solid rgb(150,150,150)',
          borderRadius: '0.5rem',
          marginBottom: '0.25rem',
        },
      }
    })
  }
}

export function run() {
  const div = document.getElementById('app-root')

  if (
    div &&
    (router !== null)
  ) {
    if (!root) root = createRoot(div)
    root.render(
      <React.StrictMode>
        <MantineProvider theme={theme}>
          <ProvidersForClient />
        </MantineProvider>
      </React.StrictMode>
    )
  } else {
    throw new Error('Could not find app-root div')
  }
}

