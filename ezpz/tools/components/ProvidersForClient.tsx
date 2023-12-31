import { FC } from "react"

import { BrowserRouter, Route, Routes } from 'react-router-dom'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { routes } from 'build/routing/routes_for_csr'
import Layouts from './Layouts'
import ProvidersForServerAndClient from "./ProvidersForServerAndClient"
import { Notifications } from '@mantine/notifications'

const ProvidersForClient: FC = () => {
  return (
    <BrowserRouter>
      <ProvidersForServerAndClient data={{}}>
        <Notifications
          autoClose={1000}
          position="bottom-left"
          opacity={0.92}
        />
        <Layouts>
          <Routes>
            {routes.map((route) => {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  Component={route.Component}
                />
              )
            })}
          </Routes>
        </Layouts>
      </ProvidersForServerAndClient>
    </BrowserRouter>
  )
}

export default ProvidersForClient