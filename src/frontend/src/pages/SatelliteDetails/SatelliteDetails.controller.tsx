import { Button } from 'app/App.components/Button/Button.controller'
import { SatellitesHeader } from 'pages/Satellites/SatellitesHeader/SatellitesHeader.controller'
import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { Message, Page } from 'styles'

export const SatelliteDetails = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { vMvkTokenStorage, myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)

  return (
    <Page>
      <SatellitesHeader />
      <br />
      <Link to="/become-satellite">
        <Button icon="satellite" text="Become a Satellite" />
      </Link>
    </Page>
  )
}
