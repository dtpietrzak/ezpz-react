import fs from 'fs'

fs.writeFileSync(
  'bundle/routes_raw.json',
  '{}',
)

fs.writeFileSync(
  'bundle/routes_for_ssr.tsx',
  'export const routes: any[] = []',
)