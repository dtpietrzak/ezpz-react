import fs from 'fs'

if (!fs.existsSync('bundle')) {
  fs.mkdirSync('bundle', { recursive: true })
}

fs.writeFileSync(
  'bundle/routes_raw.json',
  '{}',
)

fs.writeFileSync(
  'bundle/routes_for_ssr.tsx',
  'export const routes: any[] = []',
)