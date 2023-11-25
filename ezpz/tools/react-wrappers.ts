import * as React from 'react'

interface AsyncFunctionComponent<P = {}> {
  (props: P, context?: any): Promise<React.ReactNode>;
  propTypes?: React.WeakValidationMap<P> | undefined;
  contextTypes?: React.ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

export type FC<P = {}> = React.FunctionComponent<P>
export type FPC<P = {}> = React.FunctionComponent<P> | AsyncFunctionComponent<P>

export const useState = (typeof window !== 'undefined' ? React.useState : (val: any) => [val, () => {}]) as typeof React.useState

export const useEffect = (typeof window !== 'undefined' ? React.useEffect : () => {}) as typeof React.useEffect

export const useMemo = (typeof window !== 'undefined' ? React.useMemo : (fn: () => any) => fn()) as typeof React.useMemo

export const useCallback = (typeof window !== 'undefined' ? React.useCallback : (fn: () => any) => fn) as typeof React.useCallback

export const useRef = (typeof window !== 'undefined' ? React.useRef : (val: any) => ({ current: val })) as typeof React.useRef