import { useEffect, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { ProposalSubmissionView } from './ProposalSubmission.view'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const ProposalSubmission = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { pastProposals, governancePhase, currentRoundProposals } = useSelector((state: State) => state.governance)
  const [activeTab, setActiveTab] = useState<number>(1)

  const currentRoundProposalsList = currentRoundProposals?.values ? Array.from(currentRoundProposals.values()) : []

  const findUserCurrentRoundProposal = accountPkh
    ? currentRoundProposalsList.find((item) => item.proposerId === accountPkh)
    : null

  const locked = Boolean(findUserCurrentRoundProposal?.locked)

  useEffect(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch, accountPkh])

  const handleChangeTab = (tabId: number) => {
    setActiveTab(tabId)
  }

  return (
    <ProposalSubmissionView
      loading={loading}
      activeTab={activeTab}
      handleChangeTab={handleChangeTab}
      accountPkh={accountPkh}
      governancePhase={governancePhase}
      isInEmergencyGovernance={false}
      locked={locked}
      proposalId={findUserCurrentRoundProposal?.id}
      proposalTitle={findUserCurrentRoundProposal?.title || ''}
    />
  )
}
