import { getDoormanStorage, getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { checkIfUserIsSatellite } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'

import { submitProposal, SubmitProposalForm } from './ProposalSubmission.actions'
import { ProposalSubmissionView } from './ProposalSubmission.view'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const ProposalSubmission = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)

  const { delegationStorage } = useSelector((state: State) => state.delegation)

  useEffect(() => {
    dispatch(getGovernanceStorage())
    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  const submitProposalCallback = (form: SubmitProposalForm) => {
    dispatch(submitProposal(form, accountPkh as any))
  }

  return (
    <ProposalSubmissionView loading={loading} submitProposalCallback={submitProposalCallback} accountPkh={accountPkh} />
  )
}
