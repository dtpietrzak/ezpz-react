import fs from 'fs'
import crypto from 'crypto'

const buildLayouts = async (): Promise<void> => {
  return new Promise((resolve) => {
    console.time('build-layouts')

    const routes_raw = JSON.parse(fs.readFileSync('build/routing/routes_raw.json', 'utf8'))

    const paths_to_layouts: any = {}
    const layouts_to_paths: any = {}

    const generateLayoutsForPaths = (routes_object: any, previous_level?: string) => {
      previous_level = previous_level ? previous_level + '/' : ''
      const current_level = Object.entries(routes_object)

      for (let i = 0; i < current_level.length; i++) {
        const current_object = current_level[i]

        if (typeof current_object[1] === 'string') {
          const page_path = "/" + (previous_level + current_object[0]).replace('index', '')
          const page_path_array = page_path.split('/')

          const layoutPaths: string[] = []

          for (let i = 0; i < (page_path_array.length - 1); i++) {
            const layout_path =
              `src/pages${page_path_array.slice(0, i + 1).join('/')}/layout.tsx`

            const path_to_write = layout_path.replace('.tsx', '')

            if (fs.existsSync(layout_path)) {
              if (layouts_to_paths[path_to_write]) {
                layouts_to_paths[path_to_write].push(page_path)
              } else {
                layouts_to_paths[path_to_write] = [page_path]
              }
              layoutPaths.push(path_to_write)
            }
          }

          // make a hash
          // this is used to determine if the layouts have changed
          const layoutsHash = crypto.createHash('sha1')
            .update(layoutPaths.join('')).digest('hex')

          paths_to_layouts[page_path] = {
            path: page_path,
            layoutPaths: layoutPaths,
            layoutsHash: layoutsHash,
          }
        } else {
          if (typeof current_object[1] !== 'object') {
            throw new Error(`ERROR: Paths config is not of type object or string! See: ezpz/routes.ts (${typeof current_object[1]} was found)`)
          } else {
            generateLayoutsForPaths(current_object[1], previous_level + current_object[0])
          }
        }
      }

      return paths_to_layouts
    }

    generateLayoutsForPaths(routes_raw)

    fs.writeFileSync(
      'build/layouts/paths_to_layouts.json',
      JSON.stringify(paths_to_layouts, null, 2),
    )

    fs.writeFileSync(
      'build/layouts/layouts_to_paths.json',
      JSON.stringify(layouts_to_paths, null, 2),
    )

    const layouts = Object.keys(layouts_to_paths)
    const layouts_csr = layouts.map((layout_path) => {
      return layout_path.replace('src/pages', 'build/csr/pages')
    })
    const layouts_ssr = layouts.map((layout_path) => {
      return layout_path.replace('src/pages', 'build/ssr/pages')
    })

    let layout_imports_csr = ''
    let layout_imports_ssr = ''

    for (let i = 0; i < layouts_csr.length; i++) {
      layout_imports_csr += `import * as Layout${i} from '${layouts_csr[i]}'\n`
      layout_imports_ssr += `import * as Layout${i} from '${layouts_ssr[i]}'\n`
    }

    const layouts_file_csr = `
import { FC } from 'react'
import { Entry, LayoutCSR } from 'ezpz/types'
${layout_imports_csr}

export const layouts_entries: Entry<LayoutCSR>[] = [
  ${Object.entries(paths_to_layouts).map((entry: any) => {
      return `[
      '${entry[0]}',
      {
        path: '${entry[1].path}',
        layoutPaths: ${JSON.stringify(entry[1].layoutPaths)},
        layoutsHash: '${entry[1].layoutsHash}',
        Layouts: [${entry[1].layoutPaths.reverse().map((layout_path) => {
        return `Layout${layouts.indexOf(layout_path)}.default`
      })}],
      }
    ]`
    })}
]

export const layouts_map = new Map(layouts_entries)

export default layouts_map
`

const layouts_file_ssr = `
import { FC } from 'react'
import { Entry, LayoutSSR } from 'ezpz/types'
${layout_imports_ssr}

export const layouts_entries: Entry<LayoutSSR>[] = [
  ${Object.entries(paths_to_layouts).map((entry: any) => {
      return `[
      '${entry[0]}',
      {
        path: '${entry[1].path}',
        layoutPaths: ${JSON.stringify(entry[1].layoutPaths)},
        layoutsHash: '${entry[1].layoutsHash}',
        Layouts: [${entry[1].layoutPaths.reverse().map((layout_path) => {
        return `{
          Component: Layout${layouts.indexOf(layout_path)}.default,
          loadFunctionData: Layout${layouts.indexOf(layout_path)}.loadFunctionData,
        }`
      })}],
      }
    ]`
    })}
]

export const layouts_map = new Map(layouts_entries)

export default layouts_map
`

    fs.writeFileSync(
      'build/layouts/layouts_for_csr.tsx',
      layouts_file_csr,
    )

    fs.writeFileSync(
      'build/layouts/layouts_for_ssr.tsx',
      layouts_file_ssr,
    )

    console.timeEnd('build-layouts')
    resolve()
  })
}


export default buildLayouts