import { useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

// state
import { State } from '../../../reducers'

// components
import Icon from '../Icon/Icon.view'

// view
import { ConnectWallet } from './ConnectWallet.controller'

import { ConnectWalletInfoStyled, ConnectWalletClose } from './ConnectWallet.style'

export default function ConnectWalletInfo() {
  const { ready } = useSelector((state: State) => state.wallet)

  const [isClose, setIsClose] = useState(false)

  if (ready || isClose) {
    return null
  }

  return (
    <ConnectWalletInfoStyled>
      <p>
        Connect your wallet to see your personal up-to-date data and be able to make transactions. If you don’t have a
        wallet, please click on the button on the right and install it.
      </p>
      <ConnectWallet />
      <ConnectWalletClose onClick={() => setIsClose(true)}>
        <Icon className="close-connect-wallet" id="error" />
      </ConnectWalletClose>
    </ConnectWalletInfoStyled>
  )
}
