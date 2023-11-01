import React from 'react'


export const useState = (typeof window !== 'undefined' ? React.useState : (val: any) => [val, () => {}]) as typeof React.useState

export const useEffect = (typeof window !== 'undefined' ? React.useEffect : () => {}) as typeof React.useEffect