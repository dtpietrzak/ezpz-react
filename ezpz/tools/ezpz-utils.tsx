import { ClassValue, clsx } from 'clsx'
import { JSONable, LoadStatus } from 'ezpz/types'
import { twMerge } from 'tailwind-merge'

export const isServer = (
  typeof process === 'object' &&
  process?.env?.isServer === 'true'
) || typeof document === 'undefined'
export const isClient = !isServer

export const cm = (...args: ClassValue[]): string => {
  return twMerge(clsx(...args))
}

export const isLoading = (status: LoadStatus, exclude_first?: boolean) => {
  if (status === 'first_load' && !exclude_first) return true
  if (status === 'local_load') return true
  if (status === 'loading') return true
  return false
}


let key: CryptoKey | undefined
export const toLocalStorage = async (_key: string, value: JSONable) => {
  const _value = JSON.stringify(value)
  window.localStorage.setItem(`ez-spend:${_key}`, _value)
  // try {
  //   const encoder = new TextEncoder()
  //   const plainText = encoder.encode(_value)

  //   if (!key) {
  //     const keyAsString = window.localStorage.getItem('ez-spend-k') || undefined
  //     if (keyAsString) {
  //       const keyAsBuffer = new TextEncoder().encode(keyAsString)
  //       key = await crypto.subtle.importKey(
  //         'raw',
  //         keyAsBuffer,
  //         { name: 'AES-GCM' }, // Specify the algorithm name
  //         true, // Specify whether the key is extractable
  //         ['encrypt', 'decrypt'] // Specify the key's purpose
  //       )
  //     }

  //     if (!key) {
  //       key = await window.crypto.subtle.generateKey(
  //         { name: 'AES-GCM', length: 256 },
  //         true,
  //         ['encrypt', 'decrypt']
  //       )
  //       const exportedKeyAsBuffer = await crypto.subtle.exportKey('raw', key)
  //       const exportedKeyAsString = new TextDecoder().decode(exportedKeyAsBuffer)
  //       window.localStorage.setItem('ez-spend-k', exportedKeyAsString)
  //     }

  //     if (!key) console.error('could not generate key: KG01')
  //   }

  //   const cipherText = await window.crypto.subtle.encrypt(
  //     { name: 'AES-GCM', iv: window.crypto.getRandomValues(new Uint8Array(12)) },
  //     key,
  //     plainText
  //   )
  //   const cipherTextAsString = new TextDecoder().decode(cipherText)
  //   const cipherTextAsUtf8Array = encoder.encode(cipherTextAsString)

  //   if (cipherTextAsUtf8Array.byteLength > 4000000) {
  //     console.error('value too large to store in local storage: KG03')
  //   } else {
  //     window.localStorage.setItem(`ez-spend:${_key}`, cipherTextAsString)
  //   }
  // } catch {
  //   console.error('could not encrypt value: KG02')
  // }
}

export const fromLocalStorage = async (_key: string): Promise<JSONable | undefined> => {
  // try {
  //   const cipherTextAsString = window.localStorage.getItem(`ez-spend:${_key}`)
  //   if (!cipherTextAsString) return null

  //   const cipherTextAsUtf8Array = new TextEncoder().encode(cipherTextAsString)
  //   const cipherText = new Uint8Array(cipherTextAsUtf8Array.buffer)

  //   if (!key) {
  //     const keyAsString = window.localStorage.getItem('ez-spend-k') || undefined
  //     console.log(keyAsString)
  //     if (keyAsString) {
  //       const keyAsBuffer = new TextEncoder().encode(keyAsString)
  //       key = await crypto.subtle.importKey(
  //         'raw',
  //         keyAsBuffer,
  //         { name: 'AES-GCM' }, // Specify the algorithm name
  //         true, // Specify whether the key is extractable
  //         ['encrypt', 'decrypt'] // Specify the key's purpose
  //       ).catch((err) => {
  //         console.error(err)
  //         console.error('could not import key: KG07') 
  //         return undefined
  //       })
  //     }

  //     if (!key) console.error('could not get key: KG04')
  //     return undefined
  //   }

  //   const plainText = await window.crypto.subtle.decrypt(
  //     { name: 'AES-GCM', iv: cipherText.slice(0, 12) },
  //     key,
  //     cipherText.slice(12)
  //   ).catch(() => {
  //     console.error('could not decrypt data: KG08') 
  //     return undefined
  //   })
  //   const plainTextAsString = new TextDecoder().decode(plainText)

  //   return JSON.parse(plainTextAsString) as JSONable | undefined
  // } catch {
  //   console.error('could not decrypt value: KG05')
  //   return undefined
  // }
  const value = window.localStorage.getItem(`ez-spend:${_key}`)
  if (!value) return undefined
  return JSON.parse(value)
}

export const susMap = <T,>(
  data: T[],
  status: LoadStatus,
  susData: T | T[],
  fn: (item: T, index: number) => React.ReactNode,
) => {
  if (status === 'first_load' && data.length === 0) {
    if (!susData) return fn(null as unknown as T, -1)
    if (Array.isArray(susData)) {
      return susData.map((item, index) => {
        return fn(item, index)
      })
    }
    return fn(susData, -1)
  }

  return data.map((item, index) => {
    return fn(item, index)
  })
}