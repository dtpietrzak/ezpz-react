import { isClient } from './ezpz-utils'
import { FC } from 'react'
import {
  Link as RLink,
  LinkProps,
  NavigateFunction,
  Location,
  useNavigate as RUseNavigate,
  useLocation as RUseLocation,
} from 'react-router-dom'

export const useLocation = isClient ?
  RUseLocation
  :
  () => ({} as Location)

export const useNavigate = isClient ?
  RUseNavigate
  :
  () => ({} as NavigateFunction)

export const Link: FC<LinkProps> = typeof window !== 'undefined' ?
  RLink
  :
  (props) => {
    return (
      <a
        // TODO: handle the props.to to href string conversion properly
        // react-router-dom has a different way of handling the to prop
        href={typeof props.to === 'string' ? props.to : undefined}
        {...props}
      >
        {props.children}
      </a>
    )
  }