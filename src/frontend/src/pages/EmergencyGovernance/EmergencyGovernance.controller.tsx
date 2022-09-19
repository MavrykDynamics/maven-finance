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
  const loading = useSelector((state: State) => Boolean(state.loading))
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceStorage, emergencyGovActive } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage, glassBroken } = useSelector((state: State) => state.breakGlass)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)

  const emergencyGovernanceLedger = emergencyGovernanceStorage?.emergencyGovernanceLedger

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
        ready={ready}
        handleTriggerEmergencyProposal={handleTriggerEmergencyProposal}
        loading={loading}
        accountPkh={accountPkh}
        emergencyGovernanceLedger={emergencyGovernanceLedger}
      />
    </Page>
  )
}
