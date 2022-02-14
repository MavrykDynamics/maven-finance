import * as React from 'react'
import { LoansStyled } from './Loans.style'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { getTreasuryStorage } from '../Treasury/Treasury.actions'

export const Loans = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { treasuryStorage } = useSelector((state: State) => state.treasury)

  useEffect(() => {
    dispatch(getTreasuryStorage())
  }, [dispatch])

  return (
    <LoansStyled>
      <div>Here on the Loans Page</div>
    </LoansStyled>
  )
}
