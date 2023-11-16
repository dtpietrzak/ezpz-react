import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { NavigationProgress } from "@mantine/nprogress"

type ProvidersProps = {
  children: React.ReactNode
}

const ProvidersForServerAndClient = ({
  children,
}: ProvidersProps) => {
  return (
    <MantineProvider>
      <ModalsProvider>
        <NavigationProgress />
        {children}
      </ModalsProvider>
    </MantineProvider>
  )
}

export default ProvidersForServerAndClient