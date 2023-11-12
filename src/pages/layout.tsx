import { FC } from "ezpz"

const BasicLayout: FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const timestamp = new Date().getTime()

  return (
    <div id='layout_component'>
      <div>header: {timestamp}</div>
      {children}
    </div>
  )
}

export default BasicLayout