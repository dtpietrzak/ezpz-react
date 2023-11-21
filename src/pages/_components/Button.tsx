import * as React from "react"
import { ButtonHTMLAttributes } from "react"
import { useLocation, FC } from "ezpz"

const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {

  return (
    <button {...props} />
  )
}

export default Button