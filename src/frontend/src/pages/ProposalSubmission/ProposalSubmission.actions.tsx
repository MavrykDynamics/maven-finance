import { validateAddress } from '@taquito/utils'
import { OpKind } from '@taquito/taquito'

// helpres
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { getGovernanceStorage, getCurrentRoundProposals } from '../Governance/Governance.actions'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'

// types
import type { AppDispatch, GetState } from '../../app/App.controller'
import { SubmitProposalForm } from '../../utils/TypesAndInterfaces/Forms'
import { State } from 'reducers'
import { ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'

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
      const { title, description, ipfs, sourceCode } = form
      const transaction = await contract?.methods.propose(title, description, ipfs, sourceCode).send({ amount })

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
      console.error('submitProposal error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch({
        type: SUBMIT_PROPOSAL_ERROR,
        error,
      })
    }
  }

//TODO: this action will be rebuild after Tristan chnages
export const PROPOSAL_UPDATE_REQUEST = 'PROPOSAL_UPDATE_REQUEST'
export const PROPOSAL_UPDATE_RESULT = 'PROPOSAL_UPDATE_RESULT'
export const PROPOSAL_UPDATE_ERROR = 'PROPOSAL_UPDATE_ERROR'
export const updateProposal =
  (proposalBytes: ProposalRecordType['proposalData'], proposalId: number | undefined) =>
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
        proposalBytes,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

      const listTransactions = proposalBytes.map((item) => {
        return {
          kind: OpKind.TRANSACTION,
          ...contract?.methods.updateProposalData(proposalId, item.title, item.encoded_code).toTransferParams(),
        }
      })

      const batch =
        // @ts-ignore
        contract && listTransactions.length ? await state.wallet.tezos?.wallet.batch(listTransactions) : null

      const batchOp = await batch?.send()

      dispatch(showToaster(INFO, 'Updating proposal...', 'Please wait 30s'))
      const done = await batchOp?.confirmation()
      console.log('done', done)

      await dispatch(showToaster(SUCCESS, 'Proposal updated.', 'All good :)'))

      await dispatch({
        type: PROPOSAL_UPDATE_RESULT,
      })

      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch({
        type: PROPOSAL_UPDATE_ERROR,
        error,
      })
    }
  }

//TODO: this action will be rebuild after Tristan chnages
export const PROPOSAL_DELETE_REQUEST = 'PROPOSAL_DELETE_REQUEST'
export const PROPOSAL_DELETE_RESULT = 'PROPOSAL_DELETE_RESULT'
export const PROPOSAL_DELETE_ERROR = 'PROPOSAL_DELETE_ERROR'
export const deleteProposalDataPair =
  (title: string, bytes: string, proposalId: number | undefined) =>
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
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

      const transaction = await contract?.methods.updateProposalData(proposalId, title, bytes).send()
      console.log('transaction', transaction)

      await dispatch(showToaster(INFO, 'Delete proposal Bype Pair...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Delete proposal Bype Pair updated.', 'All good :)'))

      await dispatch({ type: PROPOSAL_DELETE_RESULT })

      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch({
        type: PROPOSAL_DELETE_ERROR,
        error,
      })
    }
  }

export const LOCK_PROPOSAL_REQUEST = 'LOCK_PROPOSAL_REQUEST'
export const LOCK_PROPOSAL_RESULT = 'LOCK_PROPOSAL_RESULT'
export const LOCK_PROPOSAL_ERROR = 'LOCK_PROPOSAL_ERROR'
export const lockProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
    const transaction = await contract?.methods.lockProposal(proposalId).send()
    await dispatch(showToaster(INFO, 'Locking proposal...', 'Please wait 30s'))
    await transaction?.confirmation()

    dispatch(showToaster(SUCCESS, 'Proposal locked.', 'All good :)'))
    dispatch({ type: LOCK_PROPOSAL_RESULT })
    await dispatch(getGovernanceStorage())
    await dispatch(getDelegationStorage())
    await dispatch(getCurrentRoundProposals())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: LOCK_PROPOSAL_ERROR,
      error,
    })
  }
}

//TODO: this action will be rebuild after Tristan chnages
export const SUBMIT_FINANCIAL_DATA_REQUEST = 'SUBMIT_FINANCIAL_DATA_REQUEST'
export const SUBMIT_FINANCIAL_DATA_RESULT = 'SUBMIT_FINANCIAL_DATA_RESULT'
export const SUBMIT_FINANCIAL_DATA_ERROR = 'SUBMIT_FINANCIAL_DATA_ERROR'
export const submitFinancialRequestData =
  (proposalId: number, newProposalPayments: ProposalRecordType['proposalPayments']) =>
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
      await dispatch({
        type: SUBMIT_FINANCIAL_DATA_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      console.log('contract', contract)

      const listTransactions = newProposalPayments.map((payment) => {
        const { token_address, token_amount, to__id, title } = payment

        if (+token_amount < 1) {
          throw new Error('Amount must be more 0')
        }
        if (!to__id || !validateAddress(to__id)) {
          throw new Error('Correct the addresses')
        }

        if (token_address.toLowerCase() === 'xtz') {
          return {
            kind: OpKind.TRANSACTION,
            ...contract?.methods
              .updatePaymentData(proposalId, title, to__id, +token_amount * 1_000_000, 'tez')
              .toTransferParams(),
          }
        }

        return {
          kind: OpKind.TRANSACTION,
          ...contract?.methods
            .updatePaymentData(
              proposalId,
              title,
              to__id,
              +token_amount * 1_000_000_000,
              'fa2',
              state.mvkToken.mvkTokenStorage.address,
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
      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch({
        type: SUBMIT_FINANCIAL_DATA_ERROR,
        error,
      })
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
    await dispatch(showToaster(INFO, 'Drop proposal...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Proposal Droped.', 'All good :)'))
    dispatch({
      type: DROP_PROPOSAL_RESULT,
    })
    await dispatch(getGovernanceStorage())
    await dispatch(getDelegationStorage())
    await dispatch(getCurrentRoundProposals())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: DROP_PROPOSAL_ERROR,
      error,
    })
  }
}

// Delete Payment Data TODO: this action will be rebuild after Tristan chnages
export const DELETE_PAYMENT_DATA_REQUEST = 'DELETE_PAYMENT_DATA_REQUEST'
export const DELETE_PAYMENT_DATA_RESULT = 'DELETE_PAYMENT_DATA_RESULT'
export const DELETE_PAYMENT_DATA_ERROR = 'DELETE_PAYMENT_DATA_ERROR'
export const deletePaymentData =
  (proposalId: number, rowId: number) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    // TODO: do like normal crud after tristan refactoring: https://www.notion.so/Proposal-methods-7bf458ba01a743fea243018efa3f472d?d=90437a16d7fe40c2bd3f1cb67b68b869
    try {
      //   await dispatch({
      //     type: DELETE_PAYMENT_DATA_REQUEST,
      //   })
      //   const [receiverAddress, dataName, amount, tokenType] = data
      //   const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      //   console.log('contract', contract)

      //   let transaction = null
      //   if (tokenType === 'XTZ') {
      //     transaction = await contract?.methods
      //       .updatePaymentData(proposalId, dataName, receiverAddress, +amount * 1_000_000, 'tez')
      //       .send()
      //   } else {
      //     transaction = await contract?.methods
      //       .updatePaymentData(
      //         proposalId,
      //         dataName,
      //         receiverAddress,
      //         +amount * 1_000_000_000,
      //         'fa2',
      //         tokenContractAddress,
      //         0,
      //       )
      //       .send()
      //   }

      //   await dispatch(showToaster(INFO, 'Delete Payment Data...', 'Please wait 30s'))

      //   const done = await transaction?.confirmation()
      // console.log('done', done)
      await dispatch(showToaster(SUCCESS, 'Delete Payment Data.', 'All good :)'))

      await dispatch({
        type: DELETE_PAYMENT_DATA_RESULT,
      })
      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch({
        type: DELETE_PAYMENT_DATA_ERROR,
        error,
      })
    }
  }
