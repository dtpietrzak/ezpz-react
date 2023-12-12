import { port } from "src/server"

export const addRelativeToFetch = () => {
  const node_fetch = fetch
  /* eslint-disable no-global-assign */
  // @ts-ignore
  fetch = (...args: any[]) => {
    if (args[0].startsWith('/')) args[0] = `http://localhost:${port}${args[0]}`
    // @ts-ignore
    return node_fetch(...args)
  }
  /* eslint-enable no-global-assign */
}