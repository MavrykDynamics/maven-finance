import WertWidget from '@wert-io/widget-initializer'

import { useDispatch, useSelector } from 'react-redux'
import { useMedia } from 'react-use'
import { useHistory } from 'react-router-dom'

import { State } from '../../../reducers'
import { changeWallet, connect, disconnect } from './ConnectWallet.actions'
import { ConnectWalletStyled } from './ConnectWallet.style'
import { ConnectedWalletBlock, CoinsInfoType, InstallWalletButton, NoWalletConnectedButton } from './ConnectWallet.view'
import { getWertOptions } from './Wert/WertIO.const'
import { useCallback, useState } from 'react'
import WertIoPopup from './Wert/WertIoPopup'
import { toggleSidebarCollapsing } from '../Menu/Menu.actions'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'
import { toggleLoader } from '../Loader/Loader.action'
import { WERT_IO_LOADER } from 'utils/constants'

type ConnectWalletProps = {
  className?: string
  closeMobileMenu?: (e: React.MouseEvent<HTMLElement>) => void
}

export const ConnectWallet = ({ className, closeMobileMenu }: ConnectWalletProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const [showWertIoPopup, setShowWertIoPopup] = useState(false)
  const {
    accountPkh,
    user: { myMvkTokenBalance, mySMvkTokenBalance, myXTZTokenBalance },
  } = useSelector((state: State) => state.wallet)
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const { tokensPrices } = useSelector((state: State) => state.tokens)

  const isMobileView = useMedia('(max-width: 870px)')

  const handleConnect = async () => {
    await dispatch(connect())
  }

  const handleNewConnect = async () => {
    await dispatch(changeWallet())
  }

  const disconnectWallet = async () => {
    await dispatch(disconnect())
  }

  const wertLoaderToogler = async (loader?: typeof WERT_IO_LOADER) => {
    await dispatch(toggleLoader(loader))
  }

  const showWertIoErrorToaster = () => {
    dispatch(
      showToaster(
        ERROR,
        'Wert io interaction error',
        'Error while interaction with wert io service happened, try later',
      ),
    )
  }

  const mountWertWiget = (commodity: string) => {
    wertLoaderToogler(WERT_IO_LOADER)
    const wertOptions = getWertOptions(commodity, setShowWertIoPopup, showWertIoErrorToaster, wertLoaderToogler)
    const wertWidgetInstance = new WertWidget(wertOptions)
    wertWidgetInstance.mount()
  }

  // will implemented after Sam's answers about data for this block
  const coinsInfo: CoinsInfoType = {
    MVKExchangeRate: exchangeRate,
    userMVKBalance: myMvkTokenBalance,
    userXTZBalance: myXTZTokenBalance,
    userMVKStaked: mySMvkTokenBalance,
    XTZExchnageRate: tokensPrices?.tezos?.usd ?? 1,
  }

  const detailsHandlers = {
    buyMVKHandler: () => mountWertWiget('MVK'),
    buyXTZHandler: () => mountWertWiget('XTZ'),
    stakeMVKHandler: () => history.push('/'),
  }

  const closeAllForMobileMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setShowWertIoPopup(false)
    if (closeMobileMenu) closeMobileMenu(e)
    dispatch(toggleSidebarCollapsing(false))
  }, [])

  return (
    <ConnectWalletStyled className={className} id={'connectWalletButton'}>
      {/* For use of Beacon wallet, comment out below line and remove false section of this conditional */}
      {/* {wallet ? ( */}
      <>
        {accountPkh ? (
          <>
            <ConnectedWalletBlock
              accountPkh={accountPkh}
              signOutHandler={disconnectWallet}
              changeWalletHandler={handleNewConnect}
              coinsInfo={coinsInfo}
              isMobile={isMobileView}
              detailsHandlers={detailsHandlers}
              closeMobileMenu={closeAllForMobileMenu}
            />
            <WertIoPopup closePopup={() => setShowWertIoPopup(false)} isOpened={showWertIoPopup} />
          </>
        ) : (
          <NoWalletConnectedButton handleConnect={handleConnect} />
        )}
      </>
      {/* ) : ( */}
      {/* <InstallWalletButton /> */}
      {/* )} */}
    </ConnectWalletStyled>
  )
}
