import * as React from 'react'
import { LoansStyled } from './Loans.style'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { getTreasuryStorage } from '../Treasury/Treasury.actions'
import { Page } from 'styles'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

export const Loans = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { treasuryStorage } = useSelector((state: State) => state.treasury)

  useEffect(() => {
    dispatch(getTreasuryStorage())
  }, [dispatch])

  return (
    <Page>
      <PageHeader page={'loans'} kind={PRIMARY} loading={loading} />
      <LoansStyled>
        <div>Here on the Loans Page</div>
      </LoansStyled>
    </Page>
  )
}
