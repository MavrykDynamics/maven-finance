import * as PropTypes from 'prop-types'
import * as React from 'react'

import { ConnectWalletView } from './ConnectWallet.view'

type ConnectWalletProps = {
  loading: boolean
  wallet: any
  ready: boolean
  accountPkh?: string
  myMvkTokenBalance?: string | number
  handleConnect: () => void
  handleNewConnect: () => void
  type?: string | null
}

export const ConnectWallet = ({
  loading,
  wallet,
  ready,
  accountPkh,
  myMvkTokenBalance,
  handleConnect,
  handleNewConnect,
  type,
}: ConnectWalletProps) => {
  return (
    <ConnectWalletView
      type={type}
      loading={loading}
      wallet={wallet}
      ready={ready}
      accountPkh={accountPkh}
      myMvkTokenBalance={myMvkTokenBalance}
      handleConnect={handleConnect}
      handleNewConnect={handleNewConnect}
    />
  )
}

ConnectWallet.propTypes = {
  loading: PropTypes.bool,
  wallet: PropTypes.any,
  ready: PropTypes.bool,
  accountPkh: PropTypes.string,
  myMvkTokenBalance: PropTypes.string || PropTypes.number,
  handleConnect: PropTypes.func.isRequired,
  handleNewConnect: PropTypes.func.isRequired,
  type: PropTypes.string,
}

ConnectWallet.defaultProps = {
  loading: false,
  wallet: undefined,
  ready: true,
  accountPkh: 'string',
  myMvkTokenBalance: '0',
  handleConnect: undefined,
  handleNewConnect: undefined,
  type: 'text',
}
