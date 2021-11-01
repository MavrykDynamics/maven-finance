import { DAppProvider } from 'dapp/dapp'
import { APP_NAME } from 'dapp/defaults'
import { Stake } from 'pages/Stake/Stake.controller'
import React from 'react'
import { useState } from 'react'
import { Provider as AlertProvider, positions, types } from 'react-alert'
//@ts-ignore
import AlertTemplate from 'react-alert-template-basic'
import { Provider } from 'react-redux'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import { Menu } from './App.components/Menu/Menu.controller'
import { ProgressBar } from './App.components/ProgressBar/ProgressBar.controller'
import { configureStore } from './App.store'
import { AppContainer } from './App.style'

const options = {
  timeout: 5000,
  position: positions.TOP_RIGHT,
  type: types.ERROR,
}

export const store = configureStore({})

export const App = () => {
  const [transactionPending, setTransactionPending] = useState<boolean>(false)

  return (
    <Provider store={store}>
      <Router>
        <AlertProvider template={AlertTemplate} {...options}>
          <DAppProvider appName={APP_NAME}>
            <React.Suspense fallback={null}>
              <ProgressBar />
              <AppContainer>
                <Menu />
                <Switch>
                  <Route exact path="/">
                    <Stake transactionPending={transactionPending} setTransactionPending={setTransactionPending} />
                  </Route>
                  <Route exact path="/stake">
                    <Stake transactionPending={transactionPending} setTransactionPending={setTransactionPending} />
                  </Route>
                </Switch>
              </AppContainer>
            </React.Suspense>
          </DAppProvider>
        </AlertProvider>
      </Router>
    </Provider>
  )
}
