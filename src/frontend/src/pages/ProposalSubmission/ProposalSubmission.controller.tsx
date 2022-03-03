import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { submitProposal, SubmitProposalForm } from './ProposalSubmission.actions'
import { ProposalSubmissionView } from './ProposalSubmission.view'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const ProposalSubmission = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const [activeTab, setActiveTab] = useState<number>(1)

  useEffect(() => {
    dispatch(getGovernanceStorage())
    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  const submitProposalCallback = (form: SubmitProposalForm) => {
    dispatch(submitProposal(form, accountPkh as any))
  }

  const handleChangeTab = (tabId: number) => {
    // TODO: Implement function and dispatch action
    console.log('Here in move to next round')
    setActiveTab(tabId)
  }

  return (
    <ProposalSubmissionView
      loading={loading}
      submitProposalCallback={submitProposalCallback}
      activeTab={activeTab}
      handleChangeTab={handleChangeTab}
      accountPkh={accountPkh}
      governancePhase={governancePhase}
      isInEmergencyGovernance={false}
    />
  )
}
