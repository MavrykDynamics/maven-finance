import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { getEmergencyGovernanceStorage } from './EmergencyGovernance.actions'
import { EmergencyGovernanceView } from './EmergencyGovernance.view'
import { getBreakGlassStorage } from '../BreakGlass/BreakGlass.actions'
import { MOCK_E_GOV_PAST_PROPOSALS } from './mockEGovProposals'

export const EmergencyGovernance = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceStorage, emergencyGovActive } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage, glassBroken } = useSelector((state: State) => state.breakGlass)

  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
  }, [dispatch])

  const handleVoteForEmergencyProposal = () => {
    console.log('Here in handleVoteForEmergencyProposal')
  }
  const handleTriggerEmergencyProposal = () => {
    console.log('Here in handleVoteForEmergencyProposal')
  }
  return (
    <Page>
      <PageHeader page={'emergency governance'} kind={PRIMARY} loading={loading} />
      <EmergencyGovernanceView
        emergencyGovernanceActive={emergencyGovActive}
        glassBroken={glassBroken}
        handleTriggerEmergencyProposal={handleTriggerEmergencyProposal}
        handleVoteForEmergencyProposal={handleVoteForEmergencyProposal}
        loading={loading}
        accountPkh={accountPkh}
        pastProposals={MOCK_E_GOV_PAST_PROPOSALS}
      />
    </Page>
  )
}
