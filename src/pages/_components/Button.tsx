
import { ButtonHTMLAttributes } from "react"
import { useServer, isClient, useLocation, FC } from "ezpz"

const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const location = useLocation()

  const [value, updateValue, statusOfValue] = useServer('testInit', {
    loadFunction: async () => {
      return { status: 'success' }
    }
  }, {})

  return (
    <button {...props}/>
  )
}

export default Button