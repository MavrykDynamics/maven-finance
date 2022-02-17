import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { getTreasuryStorage } from '../Treasury/Treasury.actions'
import { VaultsStyled } from './Vaults.style'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'

export const Vaults = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { treasuryStorage } = useSelector((state: State) => state.treasury)
  const { councilStorage } = useSelector((state: State) => state.council)
  const { vestingStorage } = useSelector((state: State) => state.vesting)

  useEffect(() => {
    dispatch(getTreasuryStorage())
  }, [dispatch])

  return (
    <Page>
      <PageHeader page={'vaults'} kind={PRIMARY} loading={loading} />
      <VaultsStyled>
        <div>Here on the Vaults Page</div>
      </VaultsStyled>
    </Page>
  )
}
