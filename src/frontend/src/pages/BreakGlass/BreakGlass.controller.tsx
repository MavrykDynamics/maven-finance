import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { getBreakGlassStatus, getBreakGlassStorage, getWhitelistDevs } from './BreakGlass.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { BreakGlassView } from './BreakGlass.view'
import { MOCK_CONTRACTS } from './mockContracts'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'

export const BreakGlass = () => {
  const dispatch = useDispatch()
  const { breakGlassStatus, glassBroken, whitelistDev } = useSelector((state: State) => state.breakGlass)
  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
    dispatch(getWhitelistDevs())
    dispatch(getBreakGlassStatus())
  }, [dispatch])

  return (
    <Page>
      <PageHeader page={'break glass'} />
      <BreakGlassView
        breakGlassStatuses={breakGlassStatus}
        glassBroken={glassBroken}
        pauseAllActive={glassBroken}
        whitelistDev={whitelistDev}
      />
    </Page>
  )
}
