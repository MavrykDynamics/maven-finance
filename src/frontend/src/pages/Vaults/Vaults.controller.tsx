import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { VaultsStyled } from './Vaults.style'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'

export const Vaults = () => {
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  return (
    <Page>
      <PageHeader page={'vaults'} />
      <VaultsStyled>
        <div>Here on the Vaults Page</div>
      </VaultsStyled>
    </Page>
  )
}
