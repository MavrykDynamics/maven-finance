import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { adminChangeGovernancePeriod, trackFarm } from './Admin.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { AdminView } from './Admin.view'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const Admin = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceStorage } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage } = useSelector((state: State) => state.breakGlass)

  useEffect(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

  const handleChangeGovernancePeriod = (chosenPeriod: string) => {
    dispatch(adminChangeGovernancePeriod(chosenPeriod))
    console.log('Here in Vote for Proposal')
  }

  const handleTrackFarm = () => {
    dispatch(trackFarm())
    console.log('Here in track farm')
  }
  return (
    <Page>
      <PageHeader page={'admin'} kind={PRIMARY} loading={loading} />
      <AdminView handleChangeGovernancePeriod={handleChangeGovernancePeriod} handleTrackFarm={handleTrackFarm} />
    </Page>
  )
}
