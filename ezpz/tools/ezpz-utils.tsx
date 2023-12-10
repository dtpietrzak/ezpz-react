import { ClassValue, clsx } from 'clsx'
import { LoadStatus } from 'ezpz/types'
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
  if (status === 'loading') return true
  return false
}