import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useEffect } from 'react'

// actions
import { getCouncilStorage, getTreasuryStorage, getVestingStorage } from './Treasury.actions'

// controller
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

// view
import TreasuryView from './Treasury.view'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { MOCK_TREASURYS } from './mockTreasury'

// styles
import { Page } from 'styles'

export const Treasury = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { treasuryStorage } = useSelector((state: State) => state.treasury)
  const { councilStorage } = useSelector((state: State) => state.council)
  const { vestingStorage } = useSelector((state: State) => state.vesting)

  useEffect(() => {
    dispatch(getTreasuryStorage())
    dispatch(getCouncilStorage())
    dispatch(getVestingStorage())
  }, [dispatch])

  return (
    <Page>
      <PageHeader page={'treasury'} kind={PRIMARY} loading={loading} />
      <TreasuryView treasury={MOCK_TREASURYS[0]} />
    </Page>
  )
}
