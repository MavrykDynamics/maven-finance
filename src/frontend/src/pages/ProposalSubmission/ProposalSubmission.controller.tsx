import { useMemo, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { ProposalSubmissionView } from './ProposalSubmission.view'

export const ProposalSubmission = () => {
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { currentRoundProposals } = useSelector((state: State) => state.governance)
  const [activeTab, setActiveTab] = useState<number>(1)

  // TODO: remove it when multiple proposals creating functional adding
  const findUserCurrentRoundProposal = useMemo(
    () => (accountPkh ? currentRoundProposals.find((item) => item.proposerId === accountPkh) : null),
    [accountPkh, currentRoundProposals],
  )

  const handleChangeTab = (tabId?: number) => {
    setActiveTab(tabId ?? 0)
  }

  return (
    <ProposalSubmissionView
      activeTab={activeTab}
      handleChangeTab={handleChangeTab}
      // TODO: review thos locked functionality when multiple proposals creating functional adding
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
