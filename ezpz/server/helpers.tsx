import { getBundlePaths } from 'ezpz/build'
import { updateRoutes } from 'ezpz/server'
import { Entry, LayoutSSR, RouteSSR } from 'ezpz/types'
import { renderToString } from 'react-dom/server'

export const scriptsToInject = (scriptsSrc: string[]) => {
  let content: string = ''

  for (let i = 0; i < scriptsSrc.length; i++) {
    content += `var e${i}=document.createElement("script");e${i}.src=${scriptsSrc[i]},e${i}.async=!0,e${i}.defer=!0,e${i}.type="module",document.body.appendChild(e${i});`
  }

  return `<script>window.onload=function(){${content}};</script>`
}

export const htmlFromRoute = async (
  route: RouteSSR,
  App: any,
  layout: LayoutSSR | undefined,
  scriptInjection?: string,
  cssSrcInjection?: string,
): Promise<string> => {

  const funcEntriesForLayout: Entry<any>[] = []

  if (layout) {
    for (let i = 0; i < layout.Layouts.length; i++) {
      await Promise.all(layout.Layouts[i].loadFunctionData.map(async (lf) => {
        if (lf.loadOnServer === false) return
        funcEntriesForLayout.push([lf.uid, (await lf.loadFunction()).data])
      }))
    }
  }

  const funcEntriesForPage: Entry<any>[] = await Promise.all(
    route.loadFunctionData.map(async (lf) => {
      if (lf.loadOnServer === false) return [lf.uid, undefined]
      return [lf.uid, (await lf.loadFunction()).data]
    })
  )

  const funcObjectForPage = Object.fromEntries(funcEntriesForPage)
  const funcObjectForLayout = Object.fromEntries(funcEntriesForLayout)

  const WithLayoutsSSR = () => {
    if (!layout) {
      return route.Component(funcObjectForPage)
    } else {
      return layout.Layouts.reduce((acc, Layout) => {
        if (!Layout.Component) return acc
        const _funcObjectForLayout = Object.fromEntries(Layout.loadFunctionData.map((lf) => {
          return [lf.uid, funcObjectForLayout[lf.uid]]
        }))
        return (
          Layout.Component({
            children: acc, ..._funcObjectForLayout,
          })
        )
      }, route.Component(funcObjectForPage)
      )
    }
  }

  const allFuncsObject = {
    ...funcObjectForPage,
    ...funcObjectForLayout,
  }

  const html =
    `<!DOCTYPE html>
      ${renderToString(
      <App pageConfig={route.config} data={allFuncsObject}>
        <WithLayoutsSSR />
      </App>
    )
      .replace('__script_injection__', scriptInjection || '')
      .replace('__css_injection__', cssSrcInjection || '')}
  <script>window.__ezpz_data__ = ${JSON.stringify(allFuncsObject)}</script>`

  // allFuncsEntries.forEach((entry) => {
  //   const key = entry[0]
  //     .replace('layout__dev_defined__', '')
  //     .replace('page__dev_defined__', '')
  //   html = html.replaceAll(
  //     `__$!replace!$__${key}__$!replace!$__`, JSON.stringify(entry[1]),
  //   )
  // })

  return html
}


export const updateRoutesWithNewBuild = async (_buildResult) => {
  const injections = getBundlePaths(_buildResult)
  const App = (await import('build/app')).default

  // ${scriptsToInject([injections.js[1]])}

  await updateRoutes(async (route, layout) => {
    return await htmlFromRoute(
      route,
      App,
      layout,
      `<script type="module" src=${injections.js[1]}></script>
      <script type="module">
        import * as entry from ${injections.js[0]};
        entry.run();
      </script>`,
      injections.css,
    )
  })
}