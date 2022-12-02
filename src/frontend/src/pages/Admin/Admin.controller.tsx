import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { adminChangeGovernancePeriod, trackFarm } from './Admin.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { AdminView } from './Admin.view'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const Admin = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

  const handleChangeGovernancePeriod = (chosenPeriod: string) => {
    dispatch(adminChangeGovernancePeriod(chosenPeriod))
  }

  const handleTrackFarm = () => {
    dispatch(trackFarm())
  }

  return (
    <Page>
      <PageHeader page={'admin'} />
      <AdminView handleChangeGovernancePeriod={handleChangeGovernancePeriod} handleTrackFarm={handleTrackFarm} />
    </Page>
  )
}
