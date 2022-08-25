import { TempleWallet } from '@temple-wallet/dapp'
import { useCallback, useEffect, useState } from 'react'
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
import { getGovernanceStorage } from '../../src/pages/Governance/Governance.actions'
import { PopupChangeNode } from './App.components/ChangeNodePopup/Popup-change-node.controller'
import { toggleRPCNodePopup } from './App.components/ChangeNodePopup/ChangeNode.actions'
import { toggleSidebarCollapsing } from './App.components/Menu/Menu.actions'
import { useMedia } from 'react-use'

export const { store, persistor } = configureStore({})

const AppContainer = () => {
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const loading = useSelector((state: State) => state.loading)
  const { changeNodePopupOpen, sidebarOpened } = useSelector((state: State) => state.preferences)
  const showSidebarOpened = useMedia('(min-width: 1400px)')

  useEffect(() => {
    dispatch(onStart())
    dispatch(getGovernanceStorage())
    // For using Beacon wallet, replace following lines with dispatch(setWallet())
    return TempleWallet.onAvailabilityChange((available) => {
      if (available) dispatch(setWallet(new TempleWallet(process.env.REACT_APP_NAME || 'MAVRYK')))
    })
  }, [dispatch])

  useEffect(() => {
    dispatch(toggleSidebarCollapsing(showSidebarOpened))
  }, [showSidebarOpened])

  const closeModalHandler = useCallback(() => dispatch(toggleRPCNodePopup(false)), [])

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
      <AppStyled isExpandedMenu={sidebarOpened}>
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
        <PopupChangeNode isModalOpened={changeNodePopupOpen} closeModal={closeModalHandler} />
        <AppRoutes />
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return <AppContainer />
}
