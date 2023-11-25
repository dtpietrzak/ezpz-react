import { FC, useEffect, useState } from "react"
import layouts_map from "build/layouts/layouts_for_csr"

let observer: MutationObserver
let oldHref: string
let oldLayoutHash: string

type LayoutsProps = {
  children: any
}

const Layouts: FC<LayoutsProps> = ({
  children,
}) => {
  const [WithLayouts, setWithLayouts] = useState<React.ReactNode | null>(null)

  const updateLayouts = () => {
    setWithLayouts(_updateLayouts(children))
  }

  useEffect(() => {
    oldLayoutHash = layouts_map
      .get(document.location.pathname)?.layoutsHash ?? ''

    updateLayouts()

    oldHref = document.location.href
    const body = document.querySelector("body")
    if (!body) return
    observer = new MutationObserver(() => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href

        if (
          oldLayoutHash !== layouts_map
            .get(document.location.pathname)?.layoutsHash
        ) {
          oldLayoutHash = layouts_map
            .get(document.location.pathname)?.layoutsHash ?? ''

          updateLayouts()
        }
      }
    })
    observer.observe(body, { childList: true, subtree: true })

    return () => {
      if (observer) observer.disconnect()
    }
  }, [])

  return WithLayouts
}

const _updateLayouts = (children: any) => {
  const routes = layouts_map.get(document.location.pathname)
  if (!routes) return null
  if (!routes.Layouts || routes.Layouts.length === 0) {
    return children
  } else {
    return routes.Layouts.reduce((acc, Layout) => {
      if (!Layout) return acc
      return (<Layout>{acc}</Layout>)
    }, children)
  }
}

export default Layouts