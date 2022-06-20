import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'

export const Council = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)

  return (
    <Page>
      <PageHeader page={'council'} kind={PRIMARY} loading={loading} />
      Council
    </Page>
  )
}
