import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { State } from '../../../reducers'
import { connect } from '../Menu/Menu.actions'

import { ConnectWalletView } from './ConnectWallet.view'

type ConnectWalletProps = {
  type?: string | null
}

export const ConnectWallet = ({ type }: ConnectWalletProps) => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { user } = useSelector((state: State) => state.user)

  console.log('%c ||||| user', 'color:yellowgreen', user)

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
      myMvkTokenBalance={user?.myMvkTokenBalance}
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
