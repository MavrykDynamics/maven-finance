import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'

import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { getEmergencyGovernanceStorage } from './EmergencyGovernance.actions'
import { EmergencyGovernanceView } from './EmergencyGovernance.view'
import { getBreakGlassStorage } from '../BreakGlass/BreakGlass.actions'
import { EmergencyGovProposalModal } from './EmergencyGovProposalModal/EmergencyGovProposalModal.controller'
import { showExitFeeModal } from './EmergencyGovProposalModal/EmergencyGovProposalModal.actions'
import { proposalRoundVote, votingRoundVote } from '../Governance/Governance.actions'

export const EmergencyGovernance = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceLedger } = useSelector(
    (state: State) => state.emergencyGovernance.emergencyGovernanceStorage,
  )

  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
  }, [dispatch])

  const handleTriggerEmergencyProposal = () => {
    dispatch(showExitFeeModal())
  }

  return (
    <Page>
      <EmergencyGovProposalModal />
      <PageHeader page={'emergency governance'} />
      <EmergencyGovernanceView
        handleTriggerEmergencyProposal={handleTriggerEmergencyProposal}
        accountPkh={accountPkh}
        emergencyGovernanceLedger={emergencyGovernanceLedger}
      />
    </Page>
  )
}
