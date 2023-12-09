import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { NavigationProgress } from "@mantine/nprogress"
import { DataProvider } from "./DataProvider"
import { theme } from 'src/_helpers/mantineTheme'

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
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <NavigationProgress />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </DataProvider>
  )
}

export default ProvidersForServerAndClient