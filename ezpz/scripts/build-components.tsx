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
      if (filePath.includes('_helpers')) return

      const newFilePath_ssr = filePath.replace('./src/', './build/ssr/')
      const newFilePath_csr = filePath.replace('./src/', './build/csr/')
      const newFilePath_Dir_ssr = newFilePath_ssr.replace(file, '')
      const newFilePath_Dir_csr = newFilePath_csr.replace(file, '')

      if (filePath.includes('_components')) {
        if (!fs.existsSync(newFilePath_Dir_ssr)) {
          fs.mkdirSync(newFilePath_Dir_ssr, { recursive: true })
        }
        if (!fs.existsSync(newFilePath_Dir_csr)) {
          fs.mkdirSync(newFilePath_Dir_csr, { recursive: true })
        }
        fs.copyFileSync(filePath, newFilePath_ssr)
        fs.copyFileSync(filePath, newFilePath_csr)
        return
      }

      if (filePath.endsWith('layout.tsx')) {
        if (!fs.existsSync(newFilePath_Dir_ssr)) {
          fs.mkdirSync(newFilePath_Dir_ssr, { recursive: true })
        }
        if (!fs.existsSync(newFilePath_Dir_csr)) {
          fs.mkdirSync(newFilePath_Dir_csr, { recursive: true })
        }
        fs.copyFileSync(filePath, newFilePath_ssr)
        fs.copyFileSync(filePath, newFilePath_csr)
        return
      }

      const component = parseComponent(filePath)

      if (typeof component?.uci !== 'string') return
      if (!component?.defaultExportName) return
      if (!component?.fileContents) return

      let ssrFileContents = component.fileContents
      let csrFileContents = component.fileContents

      // remove any serverInitIds that are already in the file
      ssrFileContents = ssrFileContents.replace(/serverInitId: ['"\`]\w+['"\`][,?]/g, '')
      csrFileContents = csrFileContents.replace(/serverInitId: ['"\`]\w+['"\`][,?]/g, '')

      // this is adding the serverInit prop to the useServerAsync Options
      component.loadFunctionInserts
        .sort((a, b) => b - a)
        .forEach((insert, i) => {
          ssrFileContents = addStringAtIndex(
            ssrFileContents,
            `\n      serverInit: ${component.loadFunctionUIDs[component.loadFunctionUIDs.length - i - 1]},\n      serverInitId: '${component.loadFunctionUIDs[component.loadFunctionUIDs.length - i - 1]}',`,
            insert + 1,
          )

          csrFileContents = addStringAtIndex(
            csrFileContents,
            `\n      serverInitId: '${component.loadFunctionUIDs[component.loadFunctionUIDs.length - i - 1]}',`,
            insert + 1,
          )
        })

      // this is adding an array of the load function names to the end of the file
      const addedLoadFunctionData = [ssrFileContents, component.loadFunctions.join('\n\n')].join('\n\n').concat(`\n\nexport const loadFunctionNames = ${JSON.stringify(component.loadFunctionNames)}\nexport const loadFunctionUIDs = ${JSON.stringify(component.loadFunctionUIDs)}`)

      const addedAsync = addedLoadFunctionData
        .replace(
          new RegExp(`const ${component.defaultExportName}(.*)= \\((.*)\\) => {`),
          // `const ${component.defaultExportName}$1= async (${component.loadFunctionUIDs.map((x) => `${x}?: any`).join(',')}) => {`,
          `const ${component.defaultExportName}$1= (${component.loadFunctionUIDs.map((x) => `${x}?: any`).join(',')}) => {`,
        ).replace(
          new RegExp(`export default function ${component.defaultExportName}\\((.*)\\) {`),
          // `export default async function ${component.defaultExportName}($1) {`,
          `export default function ${component.defaultExportName}($1) {`,
        )

      const modifiedUseServerCallsToUseServerAsync = addedAsync
        .replace(
          /const\s*\[(.*),\s*(.*),\s*(.*),\s*(.*)\]\s*=\s*useServer(.*)\(/g,
          // 'const [$1, $2, $3, $4] = await useServer$5(',
          'const [$1, $2, $3, $4] = useServer$5(',
        )
        .replace(
          /useServer/g,
          'useServerAsync',
        )

      if (!fs.existsSync(newFilePath_Dir_ssr)) {
        fs.mkdirSync(newFilePath_Dir_ssr, { recursive: true })
      }
      fs.writeFileSync(
        newFilePath_ssr,
        modifiedUseServerCallsToUseServerAsync,
      )




      if (!fs.existsSync(newFilePath_Dir_csr)) {
        fs.mkdirSync(newFilePath_Dir_csr, { recursive: true })
      }
      fs.writeFileSync(
        newFilePath_csr,
        csrFileContents,
      )
    }
  })
}

// a function to add a string to another string starting at a certain index
function addStringAtIndex(
  originalString: string,
  stringToAdd: string,
  index: number,
): string {
  return originalString.slice(0, index) + stringToAdd + originalString.slice(index);
}

readDirRecursive('./src')