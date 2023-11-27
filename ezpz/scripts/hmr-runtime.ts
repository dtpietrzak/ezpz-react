/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-inner-declarations */
if (!window.__hmr__) {
  window.__hmr__ = {
    contexts: {},
  }

  function incrementPortInUrl(url) {
    const urlObject = new URL(url)

    // Extract the port number from the URL
    let port: string = urlObject.port

    // Increment the port by 1
    port = (parseInt(port, 10) + 1).toString()

    // Set the new port in the URL object
    urlObject.port = port

    // Convert the URL object back to a string
    const updatedUrl = urlObject.toString()

    return updatedUrl
  }

  const socketURL = new URL(
    "/__hmr__",
    incrementPortInUrl(window.location.href.replace(/^http(s)?:/, "ws$1:"))
  )
  const socket = (window.__hmr__.socket = new WebSocket(socketURL.href))
  socket.addEventListener("message", async (event) => {
    const payload = JSON.parse(event.data)
    // console.log('here7')
    switch (payload?.type) {
      case "reload":
        // console.log('here8: ', payload)
        window.location.reload()
        break;
      case "hmr":
        // console.log('here9: ', payload)
        if (!payload.updates?.length) return;

        // eslint-disable-next-line no-case-declarations
        let anyAccepted = false
        for (const update of payload.updates) {
          if (window.__hmr__.contexts[update.id]) {
            const accepted = window.__hmr__.contexts[update.id].emit(
              await import(update.url + "?t=" + Date.now())
            )
            if (accepted) {
              console.log("[HMR] Updated accepted by", update.id)
              anyAccepted = true
            }
          }
        }

        if (!anyAccepted) {
          console.log("[HMR] Updated rejected, reloading...")
          window.location.reload()
        }
        break;
    }
  })

}



export function createHotContext(id: string): ImportMetaHot {
  let callback: undefined | ((mod: ModuleNamespace) => void)
  let disposed = false

  const hot = {
    accept: (cb) => {
      // console.log('here0', id)
      if (disposed) {
        throw new Error("import.meta.hot.accept() called after dispose()")
      }
      if (callback) {
        throw new Error("import.meta.hot.accept() already called")
      }
      callback = cb
    },
    dispose: () => {
      // console.log('here1', id)
      disposed = true
      callback = undefined
    },
    emit(self: ModuleNamespace) {
      // console.log('here2', id)
      if (disposed) {
        return true
        // throw new Error("import.meta.hot.emit() called after dispose()")
      }

      if (callback) {
        callback(self)
        return true
      }
      return false
    },
  }

  if (window.__hmr__.contexts[id]) {
    // console.log('here3', id)

    window.__hmr__.contexts[id].dispose()
    window.__hmr__.contexts[id] = undefined
  }
  window.__hmr__.contexts[id] = hot

  return hot;
}

declare global {
  interface Window {
    __hmr__: any;
  }
}
