import { useDispatch, useSelector } from 'react-redux'
import { useMedia } from 'react-use'

import { State } from '../../../reducers'
import { connect, disconnect } from './ConnectWallet.actions'
import { ConnectWalletStyled } from './ConnectWallet.style'
import { ConnectedWalletBlock, CoinsInfoType, InstallWalletButton, NoWalletConnectedButton } from './ConnectWallet.view'

type ConnectWalletProps = {
  className?: string
}

export const ConnectWallet = ({ className }: ConnectWalletProps) => {
  const dispatch = useDispatch()
  const { wallet, ready, accountPkh } = useSelector((state: State) => state.wallet)
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const { user } = useSelector((state: State) => state.user)
  const isMobileView = useMedia('(max-width: 870px)')

  const handleConnect = () => {
    dispatch(connect({ forcePermission: false }))
  }

  const handleNewConnect = () => {
    dispatch(connect({ forcePermission: true }))
  }

  const disconnectWallet = () => {
    dispatch(disconnect())
  }

  // will implemented after Sam's answers about data for this block
  const coinsInfo: CoinsInfoType = {
    MVKExchangeRate: exchangeRate,
    userMVKBalance: user.myMvkTokenBalance,
    userXTZBalance: 0,
    userMVKStaked: user.mySMvkTokenBalance,
    XTZExchnageRate: 0,
  }

  return (
    <ConnectWalletStyled className={className} id={'connectWalletButton'}>
      {/* For use of Beacon wallet, comment out below line and remove false section of this conditional */}
      {wallet ? (
        <>
          {ready && accountPkh ? (
            <ConnectedWalletBlock
              accountPkh={accountPkh}
              signOutHandler={disconnectWallet}
              changeWalletHandler={handleNewConnect}
              coinsInfo={coinsInfo}
              isMobile={isMobileView}
            />
          ) : (
            <NoWalletConnectedButton handleConnect={handleConnect} />
          )}
        </>
      ) : (
        <InstallWalletButton />
      )}
    </ConnectWalletStyled>
  )
}
