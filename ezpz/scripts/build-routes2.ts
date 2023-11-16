import fs from 'fs'

const buildRoutes2 = async (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    console.time('build-routes-2')

    const raw_routes_as_string = fs.readFileSync('build/routing/routes_raw.json', 'utf8')
    const pages_cache_as_string = fs.readFileSync('build/cache/pages.json', 'utf8')
    const cache_history = fs.readFileSync('build/cache/routes.json', 'utf8')

    if ((raw_routes_as_string + pages_cache_as_string) === cache_history) {
      console.log('routes are the same, skipping build')
      return resolve()
    }

    const ssr_routes = (
      // @ts-ignore
      await import('build/routing/routes_for_ssr__temp')
    ).routes

    const new_ssr_imports = ssr_routes.map((route) => {
      return `import ${route.name}, { config as ${route.name}_config${route.loadFunctionNames.map((x) => `, ${x} as ${route.name}_loadFunctions_${x}`).join('')
        } } from "../ssr/pages${route.path}index"`
    }).join('\n')

    const ssr_routes_file_content_w_loadFunctions = `// import the routes
import { Route } from 'ezpz/types'
${new_ssr_imports}
    
// router array
export const routes: Route[] = [
  ${ssr_routes.map((x) => `{
    name: '${x.name}',
    path: '${x.path}',
    Component: ${x.name},
    config: ${x.name}_config,
    loadFunctions: [${x.loadFunctionNames.map((y, i) => `{
      name: '${y}',
      uid: '${x.loadFunctionUIDs[i]}',
      loadOnServer: ${x.loadFunctionsLoadOnServer[i]},
      function: ${x.name}_loadFunctions_${y},
    }`).join(', ')}]
  }`).join(',\n  ')}
]
`

    fs.writeFileSync(
      'build/routing/routes_for_ssr.tsx',
      ssr_routes_file_content_w_loadFunctions,
    )

    fs.writeFileSync(
      'build/cache/routes.json',
      (raw_routes_as_string + pages_cache_as_string),
    )

    console.timeEnd('build-routes-2')
    resolve()
  })
}

export default buildRoutes2