import * as React from 'react'
import { LoansStyled } from './Loans.style'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

export const Loans = () => {
  const dispatch = useDispatch()
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  return (
    <Page>
      <PageHeader page={'loans'} />
      <LoansStyled>
        <div>Here on the Loans Page</div>
      </LoansStyled>
    </Page>
  )
}
