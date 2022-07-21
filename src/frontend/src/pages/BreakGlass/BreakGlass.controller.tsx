import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { getBreakGlassStatus, getBreakGlassStorage } from './BreakGlass.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { BreakGlassView } from './BreakGlass.view'
import { MOCK_CONTRACTS } from './mockContracts'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'

export const BreakGlass = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { breakGlassStatus, glassBroken } = useSelector((state: State) => state.breakGlass)
  console.log(breakGlassStatus)
  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
    dispatch(getBreakGlassStatus())
  }, [dispatch])

  return (
    <Page>
      <PageHeader page={'break glass'} kind={PRIMARY} loading={loading} />
      <BreakGlassView
        breakGlassStatuses={breakGlassStatus}
        contracts={MOCK_CONTRACTS}
        glassBroken={glassBroken}
        pauseAllActive={glassBroken}
      />
    </Page>
  )
}
