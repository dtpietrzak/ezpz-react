/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'

export type FC<P = unknown> = React.FunctionComponent<P>

export const useState = (
  typeof window !== 'undefined' ?
    React.useState :
    (val: any) => [val, () => { }]) as typeof React.useState

export const useEffect =
  typeof window !== 'undefined' ?
    React.useEffect :
    (() => { }) as typeof React.useEffect

export const useMemo =
  typeof window !== 'undefined' ?
    React.useMemo :
    ((fn: () => any) => fn()) as typeof React.useMemo

export const useCallback =
  typeof window !== 'undefined' ?
    React.useCallback :
    ((fn: () => any | Promise<any>) => fn) as typeof React.useCallback

export const useRef =
  typeof window !== 'undefined' ?
    React.useRef :
    ((val: any) => ({ current: val })) as typeof React.useRef