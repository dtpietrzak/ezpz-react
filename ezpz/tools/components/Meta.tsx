import { FC } from "react"
import { PageConfig } from "ezpz/types"

type MetaProps = {
  name: keyof PageConfig
  pageValue: PageConfig[keyof PageConfig]
  globalValue: PageConfig[keyof PageConfig]
}

export const Meta: FC<MetaProps> = ({
  name,
  pageValue,
  globalValue,
}) => {
  if (!pageValue && !globalValue) return null
  return (
    <meta
      name={name}
      content={pageValue || globalValue}
    />
  )
}