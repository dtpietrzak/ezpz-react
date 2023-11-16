import { FC, cm } from "ezpz"

const BasicLayout: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const timestamp = new Date().getTime()

  return (
    <div className={cm("flex w-full h-full justify-start")}>
      <div className={cm("h-full w-64 bg-slate-700 p-4")}>
        <p>
          Dashboard Layout:
        </p>
        <p className={cm("text-2xl font-bold text-white")}>
          {timestamp}
        </p>
      </div>
      <div className={cm("p-4 flex-1")}>
        {children}
      </div>
    </div>
  )
}

export default BasicLayout