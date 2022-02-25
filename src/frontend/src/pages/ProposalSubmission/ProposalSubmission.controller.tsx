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

export const ProposalSubmission = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { doormanStorage } = useSelector((state: State) => state.doorman)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage())
    }

    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  const submitProposalCallback = (form: SubmitProposalForm) => {
    dispatch(submitProposal(form, accountPkh as any))
  }

  return (
    <ProposalSubmissionView loading={loading} submitProposalCallback={submitProposalCallback} accountPkh={accountPkh} />
  )
}

function getUsersSatelliteIfExists(accountPkh: string, satelliteLedger: SatelliteRecord[]): SatelliteRecord {
  return satelliteLedger.filter((satellite: SatelliteRecord) => satellite.address === accountPkh)[0]
}
