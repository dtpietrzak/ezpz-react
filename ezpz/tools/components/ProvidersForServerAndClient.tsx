import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { NavigationProgress } from "@mantine/nprogress"
import { DataProvider } from "./DataProvider"

type ProvidersProps = {
  children: React.ReactNode
  data: Record<string, unknown>
}

const ProvidersForServerAndClient = ({
  children,
  data,
}: ProvidersProps) => {
  return (
    <DataProvider data={data}>
      <MantineProvider>
        <ModalsProvider>
          <NavigationProgress />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </DataProvider>
  )
}

export default ProvidersForServerAndClient