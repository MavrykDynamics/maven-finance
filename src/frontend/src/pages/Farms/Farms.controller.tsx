import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { getFarmFactoryStorage, getFarmStorage } from './Farms.actions'
import { FarmsStyled } from './Farms.style'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'

export const Farms = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { farmStorage } = useSelector((state: State) => state.farm)
  const { farmFactoryStorage } = useSelector((state: State) => state.farmFactory)

  useEffect(() => {
    dispatch(getFarmStorage())
    // dispatch(getFarmFactoryStorage())
  }, [dispatch])

  return (
    <Page>
      <FarmsStyled>
        <PageHeader page={'farms'} kind={'primary'} loading={loading} />
        <div>Here on the Farms Page</div>
      </FarmsStyled>
    </Page>
  )
}
