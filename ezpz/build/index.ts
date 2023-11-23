import buildSetup from "./build-setup"
import buildPages from "./build-pages"
import buildRoutes from "./build-routes"
import buildLayouts from "./build-layouts"
// import buildRoutes2 from "./build-routes2"
import buildPostcss from "./build-postcss"
import buildBundle, {
  getBundlePaths,
  setupEsBuild,
  esbuildContext,
} from './build-bundle'
import { BuildResult } from "esbuild"

await setupEsBuild()

export const build = async (withCache?: boolean): Promise<BuildResult> => {
  await buildSetup()
  await buildPages(withCache)
  await buildRoutes()
  await buildLayouts()
  // await buildRoutes2(withCache)
  await buildPostcss()
  return await buildBundle()
}

export const rebuild = async (withCache?: boolean): Promise<BuildResult> => {
  await buildPages(withCache)
  await buildRoutes()
  await buildLayouts()
  // await buildRoutes2(withCache)
  await buildPostcss()
  return await buildBundle()
}

export {
  esbuildContext,
  getBundlePaths,
}