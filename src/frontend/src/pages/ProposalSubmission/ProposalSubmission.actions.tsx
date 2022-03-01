import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import governanceAddress from 'deployments/governanceAddress.json'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { State } from 'reducers'

export type SubmitProposalForm = {
  title: string
  description: string
  ipfs: string
  successMVKReward: number
  invoiceTable: string
  sourceCodeLink: string
}
export const SUBMIT_PROPOSAL_REQUEST = 'SUBMIT_PROPOSAL_REQUEST'
export const SUBMIT_PROPOSAL_RESULT = 'SUBMIT_PROPOSAL_RESULT'
export const SUBMIT_PROPOSAL_ERROR = 'SUBMIT_PROPOSAL_ERROR'
export const submitProposal =
  (form: SubmitProposalForm, accountPkh: string) => async (dispatch: any, getState: any) => {
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
      const contract = await state.wallet.tezos?.wallet.at(governanceAddress.address)
      console.log('contract', contract)

      const transaction = await contract?.methods.propose(form.title, form.description, form.ipfs).send()
      console.log('transaction', transaction)

      dispatch({
        type: SUBMIT_PROPOSAL_REQUEST,
        form,
      })
      dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))

      dispatch({
        type: SUBMIT_PROPOSAL_RESULT,
      })
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
