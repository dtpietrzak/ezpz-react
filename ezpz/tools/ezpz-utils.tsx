import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const isServer =
  typeof process === 'object' &&
  process?.env?.isServer === 'true'
export const isClient = !isServer

export const cm = (...args: ClassValue[]): string => {
  return twMerge(clsx(...args))
}