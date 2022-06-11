import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import governanceAddress from 'deployments/governanceAddress.json'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { State } from 'reducers'
import { ProposalUpdateForm, SubmitProposalForm } from '../../utils/TypesAndInterfaces/Forms'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const SUBMIT_PROPOSAL_REQUEST = 'SUBMIT_PROPOSAL_REQUEST'
export const SUBMIT_PROPOSAL_RESULT = 'SUBMIT_PROPOSAL_RESULT'
export const SUBMIT_PROPOSAL_ERROR = 'SUBMIT_PROPOSAL_ERROR'
export const submitProposal =
  (form: SubmitProposalForm, amount: number, accountPkh?: string) => async (dispatch: any, getState: any) => {
    const state: State = getState()
    console.log('Got to here in submitProposal')

    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      console.log('contract', contract)

      const transaction = await contract?.methods
        .propose(form.title, form.description, form.ipfs, form.sourceCodeLink)
        .send({ amount })
      console.log('transaction', transaction)

      dispatch({
        type: SUBMIT_PROPOSAL_REQUEST,
        form: form,
      })
      dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))

      dispatch({
        type: SUBMIT_PROPOSAL_RESULT,
      })
      dispatch(getGovernanceStorage())
      dispatch(getDelegationStorage())
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: SUBMIT_PROPOSAL_ERROR,
        error,
      })
    }
  }

export const PROPOSAL_UPDATE_REQUEST = 'PROPOSAL_UPDATE_REQUEST'
export const PROPOSAL_UPDATE_RESULT = 'PROPOSAL_UPDATE_RESULT'
export const PROPOSAL_UPDATE_ERROR = 'PROPOSAL_UPDATE_ERROR'
export const updateProposal =
  (form: ProposalUpdateForm, accountPkh?: string) => async (dispatch: any, getState: any) => {
    const state: State = getState()
    console.log('Got to here in updateProposal')

    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      console.log('contract', contract)

      const transaction = await contract?.methods
        .addUpdateProposalData(form.proposalId, form.title, form.proposalBytes)
        .send()
      console.log('transaction', transaction)

      dispatch({
        type: PROPOSAL_UPDATE_REQUEST,
        form,
      })
      dispatch(showToaster(INFO, 'Updating proposal...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Proposal updated.', 'All good :)'))

      dispatch({
        type: PROPOSAL_UPDATE_RESULT,
      })

      dispatch(getGovernanceStorage())
      dispatch(getDelegationStorage())
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: PROPOSAL_UPDATE_ERROR,
        error,
      })
    }
  }

export const LOCK_PROPOSAL_REQUEST = 'LOCK_PROPOSAL_REQUEST'
export const LOCK_PROPOSAL_RESULT = 'LOCK_PROPOSAL_RESULT'
export const LOCK_PROPOSAL_ERROR = 'LOCK_PROPOSAL_ERROR'
export const lockProposal = (proposalId: number, accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()
  console.log('Got to here in lockProposal')

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)

    const transaction = await contract?.methods.lockProposal(proposalId).send()
    console.log('transaction', transaction)

    dispatch({
      type: LOCK_PROPOSAL_REQUEST,
      proposalId: proposalId,
    })
    dispatch(showToaster(INFO, 'Locking proposal...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Proposal locked.', 'All good :)'))

    dispatch({
      type: LOCK_PROPOSAL_RESULT,
    })
    dispatch(getGovernanceStorage())
    dispatch(getDelegationStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: LOCK_PROPOSAL_ERROR,
      error,
    })
  }
}

export const SUBMIT_FINANCIAL_DATA_REQUEST = 'SUBMIT_FINANCIAL_DATA_REQUEST'
export const SUBMIT_FINANCIAL_DATA_RESULT = 'SUBMIT_FINANCIAL_DATA_RESULT'
export const SUBMIT_FINANCIAL_DATA_ERROR = 'SUBMIT_FINANCIAL_DATA_ERROR'
export const submitFinancialRequestData =
  (financialRequestData: string, accountPkh?: string) => async (dispatch: any, getState: any) => {
    const state: State = getState()
    console.log('Got to here in submitFinancialRequestData')

    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      console.log('contract', contract)

      // TODO: finish implementation once the financial request methods are set up in contract
      // const transaction = await contract?.methods.lockProposal(financialRequestData).send()
      // console.log('transaction', transaction)
      //
      // dispatch({
      //   type: SUBMIT_FINANCIAL_DATA_REQUEST,
      //   proposalId: proposalId,
      // })
      // dispatch(showToaster(INFO, 'Locking proposal...', 'Please wait 30s'))
      //
      // const done = await transaction?.confirmation()
      // console.log('done', done)
      // dispatch(showToaster(SUCCESS, 'Proposal locked.', 'All good :)'))
      //
      // dispatch({
      //   type: SUBMIT_FINANCIAL_DATA_RESULT,
      // })
      dispatch(getGovernanceStorage())
      dispatch(getDelegationStorage())
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: SUBMIT_FINANCIAL_DATA_ERROR,
        error,
      })
    }
  }
