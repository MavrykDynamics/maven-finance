import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { getBreakGlassStorage, getBreakGlassStatus } from './BreakGlass.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { BreakGlassView } from './BreakGlass.view'
import { MOCK_CONTRACTS } from './mockContracts'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'

export const BreakGlass = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceStorage } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStatus, glassBroken } = useSelector((state: State) => state.breakGlass)
  console.log('%c ||||| breakGlassStatus', 'color:yellowgreen', breakGlassStatus)
  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
    dispatch(getBreakGlassStatus())
  }, [dispatch])

  const handleVoteForProposal = () => {
    console.log('Here in Vote for Proposal')
  }
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
