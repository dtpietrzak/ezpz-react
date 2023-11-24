import { getBundlePaths } from 'ezpz/build'
import { updateRoutes } from 'ezpz/server'
import { RouteSSR } from 'ezpz/types'
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
  layouts_map: Map<string, any>,
  scriptInjection?: string,
  cssSrcInjection?: string,
): Promise<string> => {

  const funcEntries = await Promise.all(
    route.loadFunctionData.map(async (lf) => {
      if (lf.loadOnServer === false) return [lf.uid, undefined]
      return [lf.uid, (await lf.loadFunction()).data]
    })
  )

  const funcObject = Object.fromEntries(funcEntries)

  const WithLayoutsSSR = () => {
    if (!layouts_map || layouts_map.has(route.path) === false) {
      return route.Component(funcObject)
    } else {
      return layouts_map.get(route.path)?.Layouts.reduce((acc, Layout) => {
        if (!Layout.Component) return acc
        return (<Layout.Component>{acc}</Layout.Component>)
      }, route.Component(funcObject)
      )
    }
  }

  return `${renderToString(
    <App pageConfig={route.config}>
      <WithLayoutsSSR />
    </App>
  )
    .replace('__script_injection__', scriptInjection || '')
    .replace('__css_injection__', cssSrcInjection || '')}
  <script>window.__ezpz_data__ = ${JSON.stringify(funcObject)}</script>`
}


export const updateRoutesWithNewBuild = async (_buildResult) => {
  const injections = getBundlePaths(_buildResult)
  const App = (await import('build/app')).default
  const layouts_map = (await import('build/layouts/layouts_for_ssr')).layouts_map
  await updateRoutes(async (route) => {
    return await htmlFromRoute(
      route,
      App,
      layouts_map,
      scriptsToInject(injections.js),
      injections.css,
    )
  })
}