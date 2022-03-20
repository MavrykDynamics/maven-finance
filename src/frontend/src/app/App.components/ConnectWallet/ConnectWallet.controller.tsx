import * as PropTypes from 'prop-types'
import * as React from 'react'

import { ConnectWalletView } from './ConnectWallet.view'
import { connect } from '../Menu/Menu.actions'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../../reducers'

type ConnectWalletProps = {
  type?: string | null
}

export const ConnectWallet = ({ type }: ConnectWalletProps) => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)

  const handleConnect = () => {
    dispatch(connect({ forcePermission: false }))
  }

  const handleNewConnect = () => {
    dispatch(connect({ forcePermission: true }))
  }
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
  type: PropTypes.string,
}

ConnectWallet.defaultProps = {
  type: 'text',
}
