import fs from 'fs'
import path from 'path'
import { mergeDeep, toCamelCase } from './helpers'

let raw_routes_from_json = {}

type PascalCase<S extends string> = string extends S
  ? string
  : S extends `${infer T}-${infer U}`
  ? `${Capitalize<T>}${PascalCase<U>}`
  : Capitalize<S>
type CamelCase<S extends string | number | symbol> = string extends S
  ? string
  : S extends `${infer T}-${infer U}`
  ? `${T}${PascalCase<U>}`
  : S

type DeepCamelCaseKeys<T> = T extends object
  ? {
    [K in keyof T as CamelCase<K>]: DeepCamelCaseKeys<T[K]>
  }
  : T

// these types will be lagged
// it will be one build behind the actual routes
// please run a build after making any change to update this type
type RawRoutesFromJson = typeof raw_routes_from_json
type Routes = DeepCamelCaseKeys<RawRoutesFromJson>

const invalid_path_names = [
  'index',
  '_index',
  '_error',
  'error',
  'components',
  'helpers',
  'layouts',
  '_layouts',
  'layout',
  '_layout',
  'filePath',
  'fileName',
  '404',
  'scripts',
]

const invalid_file_names = [
  '_index',
  'error',
  '_components',
  'components',
  'helpers',
  '_helpers',
  '_layouts',
  'layouts',
  '_layout',
  'filePath',
  'fileName',
  'scripts',
]

// @ts-ignore - this is a hack to get the type of the routes object
export let routes_raw: RawRoutesFromJson = {}

// @ts-ignore
export let routes: Routes = null

const buildRoutes = async (): Promise<void> => {
  console.time('build-routes')
  return new Promise((resolve, reject) => {
    raw_routes_from_json = JSON.parse(fs.readFileSync('build/routing/routes_raw.json', 'utf8'))

    const generatePathsConfig = (dir: string) => {
      const files = fs.readdirSync(dir)
      const paths_obj = {}

      for (let i = 0; i < files.length; i++) {
        const filePath = path.join(
          dir,
          files[i],
        )
        const isDirectory = fs.statSync(filePath).isDirectory()
        const basename = path.basename(filePath, '.tsx')

        if (!isDirectory) {
          if (invalid_file_names.includes(basename))
            throw new Error(`Cannot have a directory named ${basename}!`)

          if (basename === 'index') {
            if (filePath === 'src/pages/index.tsx') {
              paths_obj['index'] = '/'
              continue
            }
            paths_obj[basename] = '/' + filePath
              .replace('src/pages/', '')
              .replace('.tsx', '')
              .replace('index', '')
          }
        } else {
          if (invalid_path_names.includes(basename))
            throw new Error(`Cannot have a directory named ${basename}!`)
          if (basename.startsWith('_')) continue
          if (basename === 'pages') continue

          // make sure filePath only includes lowercase alphanumeric and dash
          const regex = new RegExp(/^[a-z0-9-]+$/)
          if (!regex.test(basename))
            throw new Error(`Invalid file name: ${basename}!`)

          paths_obj[basename] = generatePathsConfig(filePath)
        }

        if (basename === 'index') {
          if (isDirectory) throw new Error('Cannot have a directory named index!')
        }
      }

      return paths_obj
    }

    routes_raw = generatePathsConfig('src/pages') as RawRoutesFromJson

    fs.writeFileSync(
      'build/routing/routes_raw.json',
      JSON.stringify(routes_raw, null, 2),
    )





    const generatePathsFromPathsConfig = (path_object: any, previous_level?: string) => {
      if (routes === null) routes = {} as Routes

      previous_level = previous_level ? previous_level + '/' : ''
      const current_level = Object.entries(path_object)

      for (let i = 0; i < current_level.length; i++) {
        const current_object = current_level[i]

        if (typeof current_object[1] === 'string') {
          const path_string = (previous_level + current_object[0])
          const path_array = path_string.split('/')
          const path_json = path_array
            .map((x) => `{"${toCamelCase(x)}"`)
            .join(':')
            .concat(`:"/${path_string}"`)
            .concat(path_array.map(() => '}').join(''))

          routes = mergeDeep(routes, JSON.parse(path_json))
        } else {
          if (typeof current_object[1] !== 'object') {
            throw new Error(`ERROR: Paths config is not of type object or string! See: ezpz/routes.ts (${typeof current_object[1]} was found)`)
          } else {
            generatePathsFromPathsConfig(current_object[1], previous_level + current_object[0])
          }
        }
      }

      return routes
    }

    if (routes === null) routes = generatePathsFromPathsConfig(routes_raw)

    fs.writeFileSync(
      'build/routing/routes.json',
      JSON.stringify(routes, null, 2),
    )

    let react_router_routes: any = []
    let server_side_render_imports: any = []
    let react_router_imports: any = []

    const generateImportsForCSR = (routes_object: any) => {
      const routes_array = Object.entries(routes_object)

      for (let i = 0; i < routes_array.length; i++) {
        if (typeof routes_array[i][1] === 'string') {
          const _route_string = routes_array[i][1] as string

          const component_name = _route_string.substring(1, _route_string.length - 1).split('/').map((x) => toCamelCase(x.charAt(0).toUpperCase() + x.slice(1))).join('') + 'Index'

          const component_file_path = `'../csr/pages${_route_string.concat('index')}'`

          // we're a string, so we're a route
          react_router_imports.push(
            `import ${component_name}, { config as ${component_name}_config } from ${component_file_path}`
          )
        } else {
          // we're an object, so we're a directory
          generateImportsForCSR(routes_array[i][1])
        }
      }
    }

    const generateImportsForSSR = async (routes_object: any) => {
      const routes_array = Object.entries(routes_object)

      for (let i = 0; i < routes_array.length; i++) {
        if (typeof routes_array[i][1] === 'string') {
          const _route_string = routes_array[i][1] as string

          const component_name = _route_string.substring(1, _route_string.length - 1).split('/').map((x) => toCamelCase(x.charAt(0).toUpperCase() + x.slice(1))).join('') + 'Index'

          const component_file_path = `'../ssr/pages${_route_string.concat('index')}'`

          // we're a string, so we're a route
          server_side_render_imports.push(`import ${component_name}, { 
  config as ${component_name}_config, 
  loadFunctionNames as ${component_name}_loadFunctionNames,
  loadFunctionUIDs as ${component_name}_loadFunctionUIDs,
  loadFunctionInitIds as ${component_name}_loadFunctionInitIds,
  loadFunctionsLoadOnServer as ${component_name}_loadFunctionsLoadOnServer,
} from ${component_file_path}\n`
          )
        } else {
          // we're an object, so we're a directory
          generateImportsForSSR(routes_array[i][1])
        }
      }
    }

    generateImportsForCSR(routes_raw)
    generateImportsForSSR(routes_raw)

    const generateRoutesForCSR = async (routes_object: any) => {
      const routes_array = Object.entries(routes_object)

      for (let i = 0; i < routes_array.length; i++) {
        if (typeof routes_array[i][1] === 'string') {
          const _route_string = routes_array[i][1] as string

          const component_name = _route_string
            .substring(1, _route_string.length - 1)
            .split('/')
            .map((x) => toCamelCase(x.charAt(0).toUpperCase() + x.slice(1)))
            .join('')
            .concat('Index')

          // we're a string, so we're a route
          react_router_routes.push({
            path: _route_string,
            Component: component_name,
            config: component_name + '_config',
          })
        } else {
          // we're an object, so we're a directory
          generateRoutesForCSR(routes_array[i][1])
        }
      }
    }

    generateRoutesForCSR(routes_raw)

    const csr_file_content = `import { RouteCSR } from "ezpz/types"
import { isClient } from "ezpz"
import { createBrowserRouter } from "react-router-dom"

// import the routes
${react_router_imports.join('\n')}
    
// router array
export const routes: RouteCSR[] = [
  ${react_router_routes.map((x) => `{
    path: '${x.path}',
    Component: ${x.Component},
    config: ${x.config},
  }`).join(',\n  ')}
]
    
// init and export router
export const router = isClient ? createBrowserRouter(routes) : null;
`

    fs.writeFileSync(
      'build/routing/routes_for_csr.tsx',
      csr_file_content,
    )

    const ssr_routes_file_content = `// @ts-nocheck
// import the routes
import { TempSsrRoute } from 'ezpz/types'
${server_side_render_imports.join('\n')}

// router array
export const routes: TempSsrRoute[] = [
  ${react_router_routes.map((x) => `{
    name: '${x.Component}',
    path: '${x.path}',
    Component: ${x.Component},
    config: ${x.config},
    loadFunctionNames: ${x.Component}_loadFunctionNames,
    loadFunctionUIDs: ${x.Component}_loadFunctionUIDs,
    loadFunctionInitIds: ${x.Component}_loadFunctionInitIds,
    loadFunctionsLoadOnServer: ${x.Component}_loadFunctionsLoadOnServer,
  }`).join(',\n  ')}
] as unknown as TempSsrRoute[]
`

    fs.writeFileSync(
      'build/routing/routes_for_ssr__temp.tsx',
      ssr_routes_file_content,
    )

    console.timeEnd('build-routes')
    resolve()
  })
}

export default buildRoutes