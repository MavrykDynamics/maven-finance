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
import { PaymentsDataChangesType, ProposalDataChangesType } from './ProposalSybmittion.types'
import { checkIfWalletIsConnected, WalletOptions } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { BeaconWallet } from '@taquito/beacon-wallet'

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
      const rpcNetwork = state.preferences.REACT_APP_RPC_PROVIDER || 'https://mainnet.smartpy.io'
      // @ts-ignore
      // const wallet = new BeaconWallet(WalletOptions)
      // const walletResponse = await checkIfWalletIsConnected(wallet)

      // if (walletResponse.success) {
      //   const tzs = state.wallet.tezos
      //   await tzs.setRpcProvider(rpcNetwork)
      //   await tzs.setWalletProvider(wallet)
      const { title, description, ipfs, sourceCode } = form
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      const query = await contract?.methods.propose(title, description, ipfs, sourceCode).send({ amount })

      await dispatch(toggleLoader(ROCKET_LOADER))
      await dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

      await query?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))
      await dispatch(toggleLoader())

      await dispatch(getGovernanceStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getCurrentRoundProposals())
      // }
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

// method for update proposal data (bytes and payment)
export const updateProposalData =
  (proposalId: number, bytesChanges?: ProposalDataChangesType, paymentChanges?: PaymentsDataChangesType) =>
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

    if (!bytesChanges?.length && !paymentChanges?.length) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', "Don't have changes to save"))
      return
    }

    try {
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

      // TODO: use it when need to add an estimation for the operation
      // const listTransactions = proposalDataChanges.map((change) => {
      //   return {
      //     kind: OpKind.TRANSACTION,
      //     ...contract?.methods.updateProposalData(proposalId, [change]).toTransferParams(),
      //   }
      // }) as WalletParamsWithKind[]

      if (!contract) {
        throw new Error(`No contract provided`)
      }

      await dispatch(showToaster(INFO, 'Updating proposal...', 'Please wait 30s'))
      await dispatch(toggleLoader(ROCKET_LOADER))

      const query = await contract.methods.updateProposalData(proposalId, bytesChanges, paymentChanges).send()
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
