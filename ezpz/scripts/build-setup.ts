import fs from 'fs'

if (!fs.existsSync('bundle')) {
  fs.mkdirSync('bundle', { recursive: true })
}
if (!fs.existsSync('build')) {
  fs.mkdirSync('build/routing', { recursive: true })
}

fs.writeFileSync(
  'build/routing/routes_raw.json',
  '{}',
)

fs.writeFileSync(
  'build/routing/routes_for_csr.tsx',
  'export const routes: any[] = []\nexport const router: null = null',
)

fs.writeFileSync(
  'build/routing/routes_for_ssr.tsx',
  'export const routes: any[] = []',
)