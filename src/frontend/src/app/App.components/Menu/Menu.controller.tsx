import { getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { getHeadData } from './Menu.actions'

import { MenuView } from './Menu.view'

export const Menu = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
    }
    GetHeadData()
    // GetChainData()
  }, [dispatch, accountPkh, GetHeadData])

  // setInterval(GetHeadData, 30000)
  async function GetHeadData() {
    dispatch(getHeadData())
  }

  return <MenuView loading={loading} accountPkh={accountPkh} ready={ready} />
}
