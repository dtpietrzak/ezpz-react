import { MantineProvider, MantineTheme, Progress } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { NavigationProgress } from "@mantine/nprogress"
import { DataProvider } from "./DataProvider"

type ProvidersProps = {
  children: React.ReactNode
  data: Record<string, unknown>
}

const theme: Partial<MantineTheme> = {
  respectReducedMotion: false,
  components: {
    Progress: Progress.extend({
      styles: {
        root: {
          border: '1px solid rgb(150,150,150)',
          borderRadius: '0.5rem',
          marginBottom: '0.25rem',
        },
      }
    })
  }
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