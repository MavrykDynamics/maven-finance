import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { normalizeGovernanceStorage, normalizeProposals } from './Governance.helpers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'
import {
  GOVERNANCE_STORAGE_QUERY,
  GOVERNANCE_STORAGE_QUERY_NAME,
  GOVERNANCE_STORAGE_QUERY_VARIABLE,
  CURRENT_ROUND_PROPOSALS_QUERY,
  CURRENT_ROUND_PROPOSALS_QUERY_NAME,
  CURRENT_ROUND_PROPOSALS_QUERY_VARIABLE,
} from '../../gql/queries/getGovernanceStorage'
import { State } from '../../reducers'
import { ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'
import { toggleLoader } from 'app/App.components/Loader/Loader.action'
import { ROCKET_LOADER } from 'utils/constants'

export const SET_GOVERNANCE_PHASE = 'SET_GOVERNANCE_PHASE'
export const GET_GOVERNANCE_STORAGE = 'GET_GOVERNANCE_STORAGE'
export const SET_PAST_PROPOSALS = 'SET_PAST_PROPOSALS'
export const getGovernanceStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const { dipDupTokens } = getState().tokens
  try {
    const storage = await fetchFromIndexer(
      GOVERNANCE_STORAGE_QUERY,
      GOVERNANCE_STORAGE_QUERY_NAME,
      GOVERNANCE_STORAGE_QUERY_VARIABLE,
    )

    const convertedStorage = normalizeGovernanceStorage(storage, dipDupTokens)

    dispatch({
      type: GET_GOVERNANCE_STORAGE,
      governanceStorage: convertedStorage,
    })

    dispatch({
      type: SET_GOVERNANCE_PHASE,
      phase: convertedStorage.currentRound,
    })

    const pastProposals = convertedStorage.proposalLedger.reduce<Array<ProposalRecordType>>((acc, proposal) => {
      if (proposal.status === 1 || proposal.executed || !proposal.currentRoundProposal) {
        acc.push(proposal)
      }
      return acc
    }, [])

    dispatch({ type: SET_PAST_PROPOSALS, pastProposals })
  } catch (e) {
    console.error('getGovernanceStorage error: ', e)
  }
}

export const GET_CURRENT_ROUND_PROPOSALS = 'GET_CURRENT_ROUND_PROPOSALS'
export const getCurrentRoundProposals = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      CURRENT_ROUND_PROPOSALS_QUERY,
      CURRENT_ROUND_PROPOSALS_QUERY_NAME,
      CURRENT_ROUND_PROPOSALS_QUERY_VARIABLE,
    )

    const currentRoundProposals = normalizeProposals(storage.governance_proposal)

    dispatch({
      type: GET_CURRENT_ROUND_PROPOSALS,
      currentRoundProposals,
    })
  } catch (e) {
    console.error('getCurrentRoundProposals error: ', e)
  }
}

export const proposalRoundVote = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.proposalRoundVote(proposalId).send()

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Proposal Vote executing...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleLoader())
  } catch (error) {
    console.error('proposalRoundVote error: ', error)
    if (error instanceof Error) {
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

export const votingRinancialRequestVote =
  (vote: string, requestId: number) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    try {
      if (!state.wallet.ready) {
        dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
        return
      }

      if (state.loading) {
        dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
        return
      }

      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceFinancialAddress.address)
      const transaction = await contract?.methods.voteForRequest(requestId, vote).send()

      await dispatch(toggleLoader(ROCKET_LOADER))
      await dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
      await dispatch(getGovernanceStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

export const votingRoundVote = (vote: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.votingRoundVote(vote).send()

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

export const startProposalRound = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startProposalRound().send()

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Request Proposal round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

export const startVotingRound = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startProposalRound().send()

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Request Voting round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

export const getTimestampByLevel = async (level: number): Promise<string> => {
  if (level) {
    try {
      const timestamp = await (
        await fetch(`https://api.ghostnet.tzkt.io/v1/blocks/${level}/timestamp`, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
        })
      ).json()

      return timestamp
    } catch (error) {
      console.error('getTimestampByLevel', error)
    }
  }
  return ''
}

export const startNextRound = (executePastProposal: boolean) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startNextRound(executePastProposal).send()

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Request Next round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

export const executeProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.executeProposal(proposalId).send()

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Request Execute Proposal round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

export const processProposalPayment = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.processProposalPayment(proposalId).send()

    await dispatch(toggleLoader(ROCKET_LOADER))
    await dispatch(showToaster(INFO, 'Process Proposal Payment round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Process Proposal Payment confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}
