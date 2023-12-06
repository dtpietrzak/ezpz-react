import fs from 'fs'
import parseComponent, { devDefinedInitIdUnique } from './parser'
import crypto from 'crypto'

// server side component needs to take a prop from the load functions for each load function that exists in the page component.
// the prop name should be the variable names used in the load function's useServer hook.
// we'll need ot import them like we import the page's config, and it'd also be nice to extract them and export them from the component itself as well, this way the dev doesn't have to think about it and they can just add the prop to the useServer hook.

const buildPages = async (withCache: boolean = true): Promise<void> => {
  devDefinedInitIdUnique.clear()

  return new Promise((resolve, reject) => {
    console.time('build-pages')

    const cache_history = JSON.parse(
      fs.readFileSync('build/cache/pages.json', 'utf8'),
    )

    function readDirRecursive(dirPath: string) {
      const files = fs.readdirSync(dirPath)

      files.forEach((file) => {
        const filePath = `${dirPath}/${file}`
        const stats = fs.statSync(filePath)

        if (stats.isDirectory()) {
          readDirRecursive(filePath)
        } else {
          if (!(
            filePath.endsWith('.tsx') ||
            filePath.endsWith('.ts')
          )) return

          const newFilePath_ssr = filePath.replace('./src/', './build/ssr/')
          const newFilePath_csr = filePath.replace('./src/', './build/csr/')
          const newFilePath_Dir_ssr = newFilePath_ssr.replace(file, '')
          const newFilePath_Dir_csr = newFilePath_csr.replace(file, '')

          if (
            filePath.includes('_components') ||
            filePath.includes('_helpers') ||
            filePath.includes('_hooks')
          ) {
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

          if (!filePath.endsWith('.tsx')) return

          if (filePath === './src/app.tsx') {
            if (!fs.existsSync(newFilePath_Dir_ssr)) {
              fs.mkdirSync(newFilePath_Dir_ssr, { recursive: true })
            }
            if (!fs.existsSync(newFilePath_Dir_csr)) {
              fs.mkdirSync(newFilePath_Dir_csr, { recursive: true })
            }
            fs.copyFileSync(filePath, './build/app.tsx')
            return
          }

          let fileContents = fs.readFileSync(filePath, 'utf8')

          const file_hash = crypto
            .createHash('sha1')
            .update(fileContents)
            .digest('hex')

          if (cache_history[filePath] === file_hash && withCache) {
            return
          }

          const component = parseComponent(filePath, fileContents)

          if (typeof component?.uci !== 'string') return
          if (!component?.defaultExportName) return
          if (!component?.fileContentsCsr) return
          if (!component?.fileContentsSsr) return

          if (!fs.existsSync(newFilePath_Dir_ssr)) {
            fs.mkdirSync(newFilePath_Dir_ssr, { recursive: true })
          }
          fs.writeFileSync(
            newFilePath_ssr,
            component.fileContentsSsr,
          )

          if (!fs.existsSync(newFilePath_Dir_csr)) {
            fs.mkdirSync(newFilePath_Dir_csr, { recursive: true })
          }
          fs.writeFileSync(
            newFilePath_csr,
            component.fileContentsCsr,
          )

          console.log('updated page: ', filePath)

          cache_history[filePath] = file_hash
        }
      })

      fs.writeFileSync(
        './build/cache/pages.json',
        JSON.stringify(cache_history, null, 2)
      )
    }

    readDirRecursive('./src')

    console.timeEnd('build-pages')
    resolve()
  })
}

export default buildPages