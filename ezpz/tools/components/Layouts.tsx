import { FC, useMemo, useEffect, useState } from "react"
import routes_map from "build/routing/routes_for_csr__map"

let observer: MutationObserver
let oldHref: string
let oldLayoutHash: string

type LayoutsProps = {
  children: any
}

const Layouts: FC<LayoutsProps> = ({
  children,
}) => {
  const [WithLayouts, setWithLayouts] = useState<React.ReactNode>(null)

  useEffect(() => {
    oldLayoutHash = routes_map
      .get(document.location.pathname)?.layoutsHash ?? ''

    setWithLayouts(() => {
      const routes = routes_map.get(document.location.pathname)
      if (!routes) return null
      if (!routes.Layouts || routes.Layouts.length === 0) {
        return children
      } else {
        return routes.Layouts.reduce((acc, Layout) => {
          if (!Layout) return acc
          return (<Layout>{acc}</Layout>)
        }, children)
      }
    })

    oldHref = document.location.href
    const body = document.querySelector("body")
    observer = new MutationObserver(mutations => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href

        if (
          oldLayoutHash !== routes_map
            .get(document.location.pathname)?.layoutsHash
        ) {
          oldLayoutHash = routes_map
            .get(document.location.pathname)?.layoutsHash ?? ''

          setWithLayouts(() => {
            const routes = routes_map.get(document.location.pathname)
            if (!routes) return null
            if (!routes.Layouts || routes.Layouts.length === 0) {
              return children
            } else {
              return routes.Layouts.reduce((acc, Layout) => {
                if (!Layout) return acc
                return (<Layout>{acc}</Layout>)
              }, children)
            }
          })
        }
      }
    })
    if (!body) return
    observer.observe(body, { childList: true, subtree: true });

    return () => {
      if (observer) observer.disconnect()
    }
  }, [])

  return WithLayouts
}

export default Layouts