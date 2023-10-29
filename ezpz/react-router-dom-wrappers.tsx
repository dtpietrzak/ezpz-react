import { Link as RLink } from 'react-router-dom'

interface LinkProps {
  to: string
}
export const Link = typeof window !== 'undefined' ?
  RLink
  :
  () => null