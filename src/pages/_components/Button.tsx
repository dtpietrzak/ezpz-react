
import { ButtonHTMLAttributes } from "react"
import { useServer, isClient, useLocation, FC } from "ezpz"

const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const location = useLocation()

  return (
    <button {...props} />
  )
}

export default Button