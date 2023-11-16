import fs from 'fs'

const buildRoutes2 = async (): Promise<void> => {
  console.time('build-routes-2')
  return new Promise(async (resolve, reject) => {
    const ssr_routes = (
      // @ts-ignore
      await import('build/routing/routes_for_ssr__temp')
    ).routes

    const new_ssr_imports = ssr_routes.map((route) => {
      return `import ${route.name}, { config as ${route.name}_config${route.loadFunctionNames.map((x) => `, ${x} as ${route.name}_loadFunctions_${x}`).join('')
        } } from "../ssr/pages${route.path}index"`
    }).join('\n')

    const ssr_routes_file_content_w_loadFunctions = `
    // import the routes
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

    console.timeEnd('build-routes-2')
    resolve()
  })
}

export default buildRoutes2