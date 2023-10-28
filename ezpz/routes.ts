import fs from 'fs'
import path from 'path'

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

export let routes: any = {}

function generatePathsConfig(dir: string) {
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
      if (basename === '_components') continue
      if (basename === 'pages') continue

      paths_obj[basename] = generatePathsConfig(filePath)
    }

    if (basename === 'index') {
      if (isDirectory) throw new Error('Cannot have a directory named index!')
    }
  }

  return paths_obj
}


routes = generatePathsConfig('src/pages')

fs.writeFileSync(
  'bundle/routes.json',
  JSON.stringify(routes, null, 2),
)


// const paths_config = {
//   native: {
//     'registration': {
//       'v1': {
//         'p1': '',
//         'p2': '',
//       },
//       'v2': {
//         'p1': '',
//         'p2': '',
//         'p3': '',
//       },
//       'v3': {
//         'p1': '',
//         'p2': '',
//         'p3': '',
//         'p4': '',
//         'p5': '',
//       },
//     },
//     'onboarding': {
//       'info-slides': {
//         'p1': '',
//         'p2': '',
//         'p3': '',
//         'p4': '',
//       },
//     },
//     'paywall': {
//       'annual-trial-new-onboarding': '',
//       'annual-trial': '',
//       'discount': '',
//       'monthly-trial': '',
//       'standard': '',
//     },
//     'test-paywall': {
//       'annual-trial-new-onboarding': '',
//       'annual-trial': '',
//       'discount': '',
//       'monthly-trial': '',
//       'standard': '',
//     },
//     'auth': {
//       'sign-in': '',
//       'forgot-password': '',
//     },
//     'welcome': '',
//   },
//   webview: '',
// }









// /**
//  * Simple object check.
//  * @param item
//  * @returns {boolean}
//  */
// export function isObject(item: object): boolean {
//   return (item && typeof item === 'object' && !Array.isArray(item))
// }

// /**
//  * Deep merge two objects.
//  * @param target
//  * @param ...sources
//  */
// export function mergeDeep(target: any, ...sources: any) {
//   if (!sources.length) return target
//   const source = sources.shift()

//   if (isObject(target) && isObject(source)) {
//     for (const key in source) {
//       if (isObject(source[key])) {
//         if (!target[key]) Object.assign(target, { [key]: {} })
//         mergeDeep(target[key], source[key])
//       } else {
//         Object.assign(target, { [key]: source[key] })
//       }
//     }
//   }

//   return mergeDeep(target, ...sources)
// }

// // a function to convert a string like 'hello-world' to 'helloWorld'
// const toCamelCase = (str: string) => {
//   return str.replace(/-([a-z])/g, function (g) {
//     return g[1].toUpperCase()
//   })
// }

// type PascalCase<S extends string> = string extends S
//   ? string
//   : S extends `${infer T}-${infer U}`
//   ? `${Capitalize<T>}${PascalCase<U>}`
//   : Capitalize<S>
// type CamelCase<S extends string | number | symbol> = string extends S
//   ? string
//   : S extends `${infer T}-${infer U}`
//   ? `${T}${PascalCase<U>}`
//   : S

// type DeepCamelCaseKeys<T> = T extends object
//   ? {
//     [K in keyof T as CamelCase<K>]: DeepCamelCaseKeys<T[K]>
//   }
//   : T

// type Paths = DeepCamelCaseKeys<typeof paths_config>


// // @ts-ignore
// let paths: Paths = null

// export const generatePathsFromPathsConfig = (path_object: any, previous_level?: string) => {
//   if (paths === null) paths = {} as Paths

//   previous_level = previous_level ? previous_level + '/' : ''
//   const current_level = Object.entries(path_object)

//   for (let i = 0; i < current_level.length; i++) {
//     const current_object = current_level[i]

//     if (current_object[1] === '') {
//       const path_string = previous_level + current_object[0]
//       const path_array = path_string.split('/')
//       const path_json = path_array
//         .map((x) => `{"${toCamelCase(x)}"`)
//         .join(':')
//         .concat(`:"/${path_string}"`)
//         .concat(path_array.map(() => '}').join(''))

//       paths = mergeDeep(paths, JSON.parse(path_json))
//     } else {
//       if (typeof current_object[1] !== 'object') {
//         console.error('ERROR: Path config is not an object or blank string! See: src/paths.ts')
//       } else {
//         generatePathsFromPathsConfig(current_object[1], previous_level + current_object[0])
//       }
//     }
//   }

//   return paths
// }

// if (paths === null) paths = generatePaths(paths_config)

// console.info(paths)

// export default paths as Paths