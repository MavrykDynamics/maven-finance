import { TempleWallet } from '@temple-wallet/dapp'
import { useEffect } from 'react'
import Lottie from 'react-lottie'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'

import { State } from '../reducers'
import { onStart } from './App.actions'
import { AppRoutes } from './App.components/AppRoutes/AppRoutes.controller'
import { setWallet } from './App.components/ConnectWallet/ConnectWallet.actions'
import { Menu } from './App.components/Menu/Menu.controller'
import { ProgressBar } from './App.components/ProgressBar/ProgressBar.controller'
import { ThemeToggle } from './App.components/ThemeToggle/ThemeToggle.controller'
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { configureStore } from './App.store'
import { AppStyled, LoaderStyled } from './App.style'
import animationData from './ship-loop.json'

export const store = configureStore({})

const AppContainer = () => {
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const loading = useSelector((state: State) => state.loading)
  useEffect(() => {
    dispatch(onStart())
    // For using Beacon wallet, replace following lines with dispatch(setWallet())
    return TempleWallet.onAvailabilityChange((available) => {
      if (available) dispatch(setWallet(new TempleWallet(process.env.REACT_APP_NAME || 'MAVRYK')))
    })
  }, [dispatch])

  const animation = JSON.parse(JSON.stringify(animationData))
  const shipLoopOptions = {
    loop: true,
    autoplay: true,
    animationData: animation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <Router>
      {/* <ThemeToggle /> */}
      <ProgressBar />
      <AppStyled>
        {loading ? (
          <LoaderStyled>
            <figure>
              <div>
                <Lottie width={250} height={200} options={shipLoopOptions} isClickToPauseDisabled={true} />
              </div>
              <figcaption>Loading...</figcaption>
            </figure>
          </LoaderStyled>
        ) : null}
        <Menu />
        <AppRoutes />
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return <AppContainer />
}
