import { useMemo, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { ProposalSubmissionView } from './ProposalSubmission.view'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const ProposalSubmission = () => {
  const loading = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { governancePhase, currentRoundProposals } = useSelector((state: State) => state.governance)
  const [activeTab, setActiveTab] = useState<number>(1)

  const currentRoundProposalsList = currentRoundProposals?.values ? Array.from(currentRoundProposals.values()) : []

  const findUserCurrentRoundProposal = useMemo(
    () => (accountPkh ? currentRoundProposalsList.find((item) => item.proposerId === accountPkh) : null),
    [accountPkh, currentRoundProposalsList],
  )

  console.log('%c ||||| findUserCurrentRoundProposal', 'color:yellowgreen', findUserCurrentRoundProposal)

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
      locked={Boolean(findUserCurrentRoundProposal?.locked)}
      proposalId={findUserCurrentRoundProposal?.id}
      proposalTitle={findUserCurrentRoundProposal?.title || ''}
      proposalDescription={findUserCurrentRoundProposal?.description || ''}
      proposalSourceCode={findUserCurrentRoundProposal?.sourceCode || ''}
      proposalData={findUserCurrentRoundProposal?.proposalData}
      proposalPayments={findUserCurrentRoundProposal?.proposalPayments}
    />
  )
}
