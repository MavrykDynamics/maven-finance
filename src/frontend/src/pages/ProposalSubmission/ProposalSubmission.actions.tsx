import { validateAddress } from '@taquito/utils'
import { OpKind, WalletParamsWithKind } from '@taquito/taquito'

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
import { toggleLoader } from 'app/App.components/Loader/Loader.action'
import { ROCKET_LOADER } from 'utils/constants'
import { ProposalDataChangesType } from './ProposalSybmittion.types'

export const submitProposal =
  (form: SubmitProposalForm, amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
      const { title, description, ipfs, sourceCode } = form
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

      await dispatch(toggleLoader(ROCKET_LOADER))
      await dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

      await (await contract?.methods.propose(title, description, ipfs, sourceCode).send({ amount }))?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))
      await dispatch(toggleLoader())

      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      console.error('submitProposal error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

export const dropProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Drop proposal...', 'Please wait 30s'))

    await (await contract?.methods.dropProposal(proposalId).send())?.confirmation()

    dispatch(showToaster(SUCCESS, 'Proposal Droped.', 'All good :)'))
    await dispatch(toggleLoader())

    await dispatch(getGovernanceStorage())
    await dispatch(getDelegationStorage())
    await dispatch(getCurrentRoundProposals())
  } catch (error) {
    console.error('dropProposal error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

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
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Locking proposal...', 'Please wait 30s'))

    await (await contract?.methods.lockProposal(proposalId).send())?.confirmation()

    await dispatch(toggleLoader())
    await dispatch(showToaster(SUCCESS, 'Proposal locked.', 'All good :)'))

    await dispatch(getGovernanceStorage())
    await dispatch(getDelegationStorage())
    await dispatch(getCurrentRoundProposals())
  } catch (error) {
    console.error('lockProposal error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

// method for update proposal data (bytes)
export const updateProposalData =
  (proposalDataChanges: ProposalDataChangesType, proposalId?: number) =>
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

      const listTransactions = proposalDataChanges.map((change) => {
        return {
          kind: OpKind.TRANSACTION,
          ...contract?.methods.updateProposalData(proposalId, [change]).toTransferParams(),
        }
      }) as WalletParamsWithKind[]

      if (!contract || !listTransactions.length) {
        throw new Error(
          `no contarct or transactions provided, contract: ${contract}, listTransactions: ${listTransactions}`,
        )
      }

      const query = await state.wallet.tezos?.wallet.batch(listTransactions)?.send()

      await dispatch(showToaster(INFO, 'Updating proposal...', 'Please wait 30s'))
      await dispatch(toggleLoader(ROCKET_LOADER))

      await query?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Proposal updated.', 'All good :)'))
      await dispatch(toggleLoader())

      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

export const removeProposalDataItem =
  (removeIndex: number | string, proposalId?: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      const query = await contract?.methods
        .updateProposalData(proposalId, [{ removeProposalData: removeIndex }])
        ?.send()

      await dispatch(showToaster(INFO, 'Removing bytes pair...', 'Please wait 30s'))
      await dispatch(toggleLoader(ROCKET_LOADER))

      await query?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Bytes pair removed.', 'All good :)'))
      await dispatch(toggleLoader())

      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

export const removePaymentsDataItem =
  (removeIndex: number | string, proposalId?: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      const query = await contract?.methods.updateProposalData(proposalId, [{ removePaymentData: removeIndex }])?.send()

      await dispatch(showToaster(INFO, 'Removing payment item...', 'Please wait 30s'))
      await dispatch(toggleLoader(ROCKET_LOADER))

      await query?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Payment item removed.', 'All good :)'))
      await dispatch(toggleLoader())

      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// TODO: replace bottom action with new ones
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
      await dispatch(toggleLoader(ROCKET_LOADER))
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

      await dispatch(toggleLoader())
      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

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
      //   await dispatch(toggleLoader(ROCKET_LOADER))
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

      await dispatch(toggleLoader())
      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }
