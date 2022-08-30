import { validateAddress } from '@taquito/utils'
import { OpKind } from '@taquito/taquito'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { State } from 'reducers'
import { ProposalUpdateForm, SubmitProposalForm } from '../../utils/TypesAndInterfaces/Forms'
import { getGovernanceStorage, getCurrentRoundProposals } from '../Governance/Governance.actions'

export const SUBMIT_PROPOSAL_REQUEST = 'SUBMIT_PROPOSAL_REQUEST'
export const SUBMIT_PROPOSAL_RESULT = 'SUBMIT_PROPOSAL_RESULT'
export const SUBMIT_PROPOSAL_ERROR = 'SUBMIT_PROPOSAL_ERROR'
export const submitProposal =
  (form: SubmitProposalForm, amount: number, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.ready) {
      await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      await dispatch({
        type: SUBMIT_PROPOSAL_REQUEST,
        form: form,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

      const proposalName = form.title
      const proposalDesc = form.description
      const proposalIpfs = form.ipfs
      const proposalSourceCode = form.sourceCodeLink

      const transaction = await contract?.methods
        .propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode)
        .send({ amount })
      console.log('transaction', transaction)

      await dispatch({
        type: SUBMIT_PROPOSAL_RESULT,
        form: form,
      })
      await dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      callback?.()
      await dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))

      await dispatch({
        type: SUBMIT_PROPOSAL_RESULT,
      })
      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: SUBMIT_PROPOSAL_ERROR,
          error,
        })
      }
    }
  }

export const PROPOSAL_UPDATE_REQUEST = 'PROPOSAL_UPDATE_REQUEST'
export const PROPOSAL_UPDATE_RESULT = 'PROPOSAL_UPDATE_RESULT'
export const PROPOSAL_UPDATE_ERROR = 'PROPOSAL_UPDATE_ERROR'
export const updateProposal =
  (form: ProposalUpdateForm, proposalId: number | undefined, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      dispatch({
        type: PROPOSAL_UPDATE_REQUEST,
        form,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

      const listTransactions = form.proposalBytes.map((item) => {
        return {
          kind: OpKind.TRANSACTION,
          ...contract?.methods.updateProposalData(proposalId, item.title, item.bytes).toTransferParams(),
        }
      })

      console.log('%c ||||| listTransactions', 'color:pink', listTransactions)

      const batch =
        // @ts-ignore
        contract && listTransactions.length ? await state.wallet.tezos?.wallet.batch(listTransactions) : null

      const batchOp = await batch?.send()

      dispatch(showToaster(INFO, 'Updating proposal...', 'Please wait 30s'))
      const done = await batchOp?.confirmation()
      console.log('done', done)

      //callback?.()
      await dispatch(showToaster(SUCCESS, 'Proposal updated.', 'All good :)'))

      await dispatch({
        type: PROPOSAL_UPDATE_RESULT,
      })

      // await dispatch(getGovernanceStorage())
      // await dispatch(getDelegationStorage())
      // await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: PROPOSAL_UPDATE_ERROR,
          error,
        })
      }
    }
  }

export const LOCK_PROPOSAL_REQUEST = 'LOCK_PROPOSAL_REQUEST'
export const LOCK_PROPOSAL_RESULT = 'LOCK_PROPOSAL_RESULT'
export const LOCK_PROPOSAL_ERROR = 'LOCK_PROPOSAL_ERROR'
export const lockProposal =
  (proposalId: number, accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.ready) {
      await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      await dispatch({
        type: LOCK_PROPOSAL_REQUEST,
        proposalId: proposalId,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      console.log('contract', contract)

      const transaction = await contract?.methods.lockProposal(proposalId).send()
      console.log('transaction', transaction)
      await dispatch(showToaster(INFO, 'Locking proposal...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Proposal locked.', 'All good :)'))

      await dispatch({
        type: LOCK_PROPOSAL_RESULT,
      })
      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: LOCK_PROPOSAL_ERROR,
          error,
        })
      }
    }
  }

export const SUBMIT_FINANCIAL_DATA_REQUEST = 'SUBMIT_FINANCIAL_DATA_REQUEST'
export const SUBMIT_FINANCIAL_DATA_RESULT = 'SUBMIT_FINANCIAL_DATA_RESULT'
export const SUBMIT_FINANCIAL_DATA_ERROR = 'SUBMIT_FINANCIAL_DATA_ERROR'
export const submitFinancialRequestData =
  (proposalId: number, submitData: string[][], tokenContractAddress?: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      dispatch({
        type: SUBMIT_FINANCIAL_DATA_REQUEST,
        proposalId: proposalId,
      })

      console.log('%c ||||| submitData', 'color:yellowgreen', submitData)
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      console.log('contract', contract)
      console.log('%c ||||| tokenContractAddress', 'color:yellowgreen', tokenContractAddress)

      const listTransactions = submitData.map((form) => {
        const [receiverAddress, dataName, amount, tokenType] = form

        if (+amount < 1) {
          throw new Error('Amount must be more 0')
        }
        if (!validateAddress(receiverAddress)) {
          throw new Error('Correct the addresses')
        }

        if (tokenType === 'XTZ') {
          return {
            kind: OpKind.TRANSACTION,
            ...contract?.methods
              .updatePaymentData(proposalId, dataName, receiverAddress, +amount * 1_000_000, 'tez')
              .toTransferParams(),
          }
        }

        return {
          kind: OpKind.TRANSACTION,
          ...contract?.methods
            .updatePaymentData(
              proposalId,
              dataName,
              receiverAddress,
              +amount * 1_000_000_000,
              'fa2',
              tokenContractAddress,
              0,
            )
            .toTransferParams(),
        }
      })

      console.log('%c ||||| listTransactions', 'color:pink', listTransactions)

      const batch =
        // @ts-ignore
        contract && listTransactions.length ? await state.wallet.tezos?.wallet.batch(listTransactions) : null

      const batchOp = await batch?.send()

      await dispatch(showToaster(INFO, 'Submit Financial Request...', 'Please wait 30s'))
      const done = await batchOp?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Submit Financial Request.', 'All good :)'))

      await dispatch({
        type: SUBMIT_FINANCIAL_DATA_RESULT,
      })
      // dispatch(getGovernanceStorage())
      // dispatch(getDelegationStorage())
      // dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: SUBMIT_FINANCIAL_DATA_ERROR,
          error,
        })
      }
    }
  }

export const DROP_PROPOSAL_REQUEST = 'DROP_PROPOSAL_REQUEST'
export const DROP_PROPOSAL_RESULT = 'DROP_PROPOSAL_RESULT'
export const DROP_PROPOSAL_ERROR = 'DROP_PROPOSAL_ERROR'
export const dropProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  await dispatch({
    type: DROP_PROPOSAL_REQUEST,
  })
  if (!state.wallet.ready) {
    await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

    const transaction = await contract?.methods.dropProposal(proposalId).send()
    console.log('transaction', transaction)

    await dispatch(showToaster(INFO, 'Drop proposal...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Proposal Droped.', 'All good :)'))

    await dispatch({
      type: DROP_PROPOSAL_RESULT,
    })
    await dispatch(getGovernanceStorage())
    await dispatch(getDelegationStorage())
    await dispatch(getCurrentRoundProposals())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: DROP_PROPOSAL_ERROR,
        error,
      })
    }
  }
}
