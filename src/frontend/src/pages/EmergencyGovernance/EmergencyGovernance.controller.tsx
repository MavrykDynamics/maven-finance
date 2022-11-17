import { useCallback, useEffect } from 'react'
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
import { dropProposal } from 'pages/ProposalSubmission/ProposalSubmission.actions'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'

// TODO: add voting when I will be able to create proposals here, and get sam clarification for it
export const EmergencyGovernance = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceLedger } = useSelector(
    (state: State) => state.emergencyGovernance.emergencyGovernanceStorage,
  )
  const { glassBroken } = useSelector((state: State) => state.breakGlass)

  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
    dispatch(getDoormanStorage())
  }, [dispatch])

  const handleTriggerEmergencyProposal = useCallback(() => {
    dispatch(showExitFeeModal())
  }, [])

  const dropProposalHandler = useCallback((proposalId: number) => {
    dispatch(dropProposal(proposalId))
  }, [])

  return (
    <Page>
      <EmergencyGovProposalModal />
      <PageHeader page={'emergency governance'} />
      <EmergencyGovernanceView
        handleTriggerEmergencyProposal={handleTriggerEmergencyProposal}
        accountPkh={accountPkh}
        emergencyGovernanceLedger={emergencyGovernanceLedger}
        dropProposalHandler={dropProposalHandler}
        isGlassBroken={glassBroken}
      />
    </Page>
  )
}
