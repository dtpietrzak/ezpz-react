import fs from 'fs'
import parseComponent from './parser'

// server side component needs to take a prop from the load functions for each load function that exists in the page component.
// the prop name should be the variable names used in the load function's useServer hook.
// we'll need ot import them like we import the page's config, and it'd also be nice to extract them and export them from the component itself as well, this way the dev doesn't have to think about it and they can just add the prop to the useServer hook.


function readDirRecursive(dirPath: string) {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = `${dirPath}/${file}`
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      readDirRecursive(filePath)
    } else {
      if (!filePath.endsWith('.tsx')) return
      if (filePath.endsWith('layout.tsx')) return
      if (filePath.includes('_helpers')) return

      if (filePath.includes('_components')) {
        fs.copyFileSync(filePath, filePath.replace('./src/', './build/ssr/'))
        return
      }

      const newFilePath = filePath.replace('./src/', './build/ssr/')
      const component = parseComponent(filePath)

      if (typeof component?.uci !== 'string') return
      if (!component?.defaultExportName) return
      if (!component?.newFileContents) return

      const addedAsync = component.newFileContents
        .replace(
          new RegExp(`const ${component.defaultExportName}(.*)= \\((.*)\\) => {`),
          `const ${component.defaultExportName}$1= async (${component.loadFunctionNames.map((x) => `${x}_init?: any`).join(',')}) => {`,
        ).replace(
          new RegExp(`export default function ${component.defaultExportName}\\((.*)\\) {`),
          `export default async function ${component.defaultExportName}($1) {`,
        )

      const awaitedUseServers = addedAsync
        .replace(
          /const \[(.*), (.*), (.*)\] = useServer(.*)\(/g,
          'const [$1, $2, $3] = await useServer$4(',
        ).replace(
          /useServer/g,
          'useServerAsync',
        )

      const newFilePathDir = newFilePath.replace(file, '')

      if (!fs.existsSync(newFilePathDir)) {
        fs.mkdirSync(newFilePathDir, { recursive: true })
      }

      fs.writeFileSync(
        newFilePath,
        awaitedUseServers,
      )
    }
  })
}

readDirRecursive('./src')




export default 'poop'