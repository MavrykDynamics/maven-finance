import { useMemo, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { ProposalSubmissionView } from './ProposalSubmission.view'

export const ProposalSubmission = () => {
  const loading = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { governancePhase, currentRoundProposals } = useSelector((state: State) => state.governance)
  const [activeTab, setActiveTab] = useState<number>(1)

  const findUserCurrentRoundProposal = useMemo(
    () => (accountPkh ? currentRoundProposals.find((item) => item.proposerId === accountPkh) : null),
    [accountPkh, currentRoundProposals],
  )

  const handleChangeTab = (tabId?: number) => {
    setActiveTab(tabId ?? 0)
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
      proposalData={findUserCurrentRoundProposal?.proposalData || []}
      proposalPayments={findUserCurrentRoundProposal?.proposalPayments || []}
    />
  )
}
