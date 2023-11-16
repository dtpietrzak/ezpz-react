import fs from 'fs'

const buildSetup = async (): Promise<void> => {
  console.time('build-setup')
  return new Promise((resolve, reject) => {
    if (!fs.existsSync('bundle')) {
      fs.mkdirSync('bundle', { recursive: true })
    }
    if (!fs.existsSync('build')) {
      fs.mkdirSync('build/cache', { recursive: true })
      fs.mkdirSync('build/csr')
      fs.mkdirSync('build/layouts')
      fs.mkdirSync('build/routing')
      fs.mkdirSync('build/ssr')
    }
    if (!fs.existsSync('build/cache')) {
      fs.mkdirSync('build/cache')
    }
    if (!fs.existsSync('build/csr')) {
      fs.mkdirSync('build/csr')
    }
    if (!fs.existsSync('build/layouts')) {
      fs.mkdirSync('build/layouts')
    }
    if (!fs.existsSync('build/routing')) {
      fs.mkdirSync('build/routing')
    }
    if (!fs.existsSync('build/ssr')) {
      fs.mkdirSync('build/ssr')
    }

    if (!fs.existsSync('build/cache/pages.json')) {
      fs.writeFileSync(
        'build/cache/pages.json',
        '{}',
      )
    }

    if (!fs.existsSync('build/routing/routes_raw.json')) {
      fs.writeFileSync(
        'build/routing/routes_raw.json',
        '{}',
      )
    }

    if (!fs.existsSync('build/routing/routes_for_csr.tsx')) {
      fs.writeFileSync(
        'build/routing/routes_for_csr.tsx',
        'export const routes: any[] = []\nexport const router: null = null',
      )
    }

    if (!fs.existsSync('build/routing/routes_for_ssr.tsx')) {
      fs.writeFileSync(
        'build/routing/routes_for_ssr.tsx',
        'export const routes: any[] = []',
      )
    }

    console.timeEnd('build-setup')
    resolve()
  })
}

export default buildSetup