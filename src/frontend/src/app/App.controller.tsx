import { TempleWallet } from '@temple-wallet/dapp'
import { APP_NAME } from 'dapp/defaults'
import { Doorman } from 'pages/Doorman/Doorman.controller'
import { useEffect } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { State } from 'reducers'
import { setWallet } from './App.components/Menu/Menu.actions'

import { Menu } from './App.components/Menu/Menu.controller'
import { ProgressBar } from './App.components/ProgressBar/ProgressBar.controller'
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { configureStore } from './App.store'
import { AppStyled } from './App.style'

export const store = configureStore({})

const AppContainer = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)

  useEffect(() => {
    return TempleWallet.onAvailabilityChange((available) => {
      if (available) dispatch(setWallet(new TempleWallet(APP_NAME)))
    })
  }, [dispatch])

  return (
    <Router>
      <ProgressBar />
      <AppStyled>
        <Menu />
        <Switch>
          <Route exact path="/">
            <Doorman loading={loading} />
          </Route>
          <Route exact path="/stake">
            <Doorman loading={loading} />
          </Route>
        </Switch>
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return (
    <Provider store={store}>
      <AppContainer />
    </Provider>
  )
}
