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

export const SET_GOVERNANCE_PHASE = 'SET_GOVERNANCE_PHASE'
export const GET_GOVERNANCE_STORAGE = 'GET_GOVERNANCE_STORAGE'
export const SET_PAST_PROPOSALS = 'SET_PAST_PROPOSALS'
export const getGovernanceStorage = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      GOVERNANCE_STORAGE_QUERY,
      GOVERNANCE_STORAGE_QUERY_NAME,
      GOVERNANCE_STORAGE_QUERY_VARIABLE,
    )

    const convertedStorage = normalizeGovernanceStorage(storage)

    dispatch({
      type: GET_GOVERNANCE_STORAGE,
      governanceStorage: convertedStorage,
    })

    dispatch({
      type: SET_GOVERNANCE_PHASE,
      phase: convertedStorage.currentRound,
    })
    dispatch({ type: SET_PAST_PROPOSALS, pastProposals: convertedStorage.proposalLedger })
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
    console.log(
      '%c ||||| storage.governance_proposal CURRENT_ROUND_PROPOSALS_QUERY',
      'color:yellowgreen',
      storage.governance_proposal,
    )
    const currentRoundProposals = normalizeProposals(storage.governance_proposal)

    console.log('%c ||||| currentRoundProposals', 'color:yellowgreen', currentRoundProposals)

    dispatch({
      type: GET_CURRENT_ROUND_PROPOSALS,
      currentRoundProposals,
    })
  } catch (e) {
    console.error('getCurrentRoundProposals error: ', e)
  }
}

export const PROPOSAL_ROUND_VOTING_REQUEST = 'PROPOSAL_ROUND_VOTING_REQUEST'
export const PROPOSAL_ROUND_VOTING_RESULT = 'PROPOSAL_ROUND_VOTING_RESULT'
export const PROPOSAL_ROUND_VOTING_ERROR = 'PROPOSAL_ROUND_VOTING_ERROR'
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

    dispatch({
      type: PROPOSAL_ROUND_VOTING_REQUEST,
      proposalId: proposalId,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.proposalRoundVote(proposalId).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Proposal Vote executing...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))

    dispatch({
      type: PROPOSAL_ROUND_VOTING_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error) {
    console.error('proposalRoundVote error: ', error)

    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: PROPOSAL_ROUND_VOTING_ERROR,
      error,
    })
  }
}

export const VOTING_ROUND_VOTING_REQUEST = 'VOTING_ROUND_VOTING_REQUEST'
export const VOTING_ROUND_VOTING_RESULT = 'VOTING_ROUND_VOTING_RESULT'
export const VOTING_ROUND_VOTING_ERROR = 'VOTING_ROUND_VOTING_ERROR'
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

    dispatch({
      type: VOTING_ROUND_VOTING_REQUEST,
      vote: vote,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.votingRoundVote(vote).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))

    dispatch({
      type: VOTING_ROUND_VOTING_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: VOTING_ROUND_VOTING_ERROR,
      error,
    })
  }
}

export const START_PROPOSAL_ROUND_REQUEST = 'START_PROPOSAL_ROUND_REQUEST'
export const START_PROPOSAL_ROUND_RESULT = 'VOTING_ROUND_VOTING_RESULT'
export const START_PROPOSAL_ROUND_ERROR = 'VOTING_ROUND_VOTING_ERROR'
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

    dispatch({
      type: START_PROPOSAL_ROUND_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.startProposalRound().send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Request Proposal round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    dispatch({
      type: START_PROPOSAL_ROUND_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: START_PROPOSAL_ROUND_ERROR,
      error,
    })
  }
}

export const START_VOTING_ROUND_REQUEST = 'START_VOTING_ROUND_REQUEST'
export const START_VOTING_ROUND_RESULT = 'START_VOTING_ROUND_RESULT'
export const START_VOTING_ROUND_ERROR = 'START_VOTING_ROUND_ERROR'
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

    dispatch({
      type: START_VOTING_ROUND_REQUEST,
    })

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.startProposalRound().send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Request Voting round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    dispatch({
      type: START_VOTING_ROUND_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: START_VOTING_ROUND_ERROR,
      error,
    })
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

export const START_NEXT_ROUND_REQUEST = 'START_NEXT_ROUND_REQUEST'
export const START_NEXT_ROUND_RESULT = 'START_NEXT_ROUND_RESULT'
export const START_NEXT_ROUND_ERROR = 'START_NEXT_ROUND_ERROR'
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

    dispatch({
      type: START_NEXT_ROUND_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)

    const transaction = await contract?.methods.startNextRound(executePastProposal).send()

    await dispatch(showToaster(INFO, 'Request Next round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    await dispatch({
      type: START_NEXT_ROUND_RESULT,
    })
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: START_NEXT_ROUND_ERROR,
      error,
    })
  }
}

export const EXECUTE_PROPOSAL_REQUEST = 'EXECUTE_PROPOSAL_REQUEST'
export const EXECUTE_PROPOSAL_RESULT = 'EXECUTE_PROPOSAL_RESULT'
export const EXECUTE_PROPOSAL_ERROR = 'EXECUTE_PROPOSAL_ERROR'
export const executeProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    await dispatch({
      type: EXECUTE_PROPOSAL_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('Execute Proposal contract', contract)
    const transaction = await contract?.methods.executeProposal(proposalId).send()
    console.log('Execute Proposal transaction', transaction)

    await dispatch(showToaster(INFO, 'Request Execute Proposal round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch({
      type: EXECUTE_PROPOSAL_RESULT,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: EXECUTE_PROPOSAL_ERROR,
      error,
    })
  }
}

export const PROCESS_PAYMENT_REQUEST = 'PROCESS_PAYMENT_REQUEST'
export const PROCESS_PAYMENT_RESULT = 'PROCESS_PAYMENT_RESULT'
export const PROCESS_PAYMENT_ERROR = 'PROCESS_PAYMENT_ERROR'
export const processProposalPayment = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    await dispatch({
      type: PROCESS_PAYMENT_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('Process Proposal Payment contract', contract)
    const transaction = await contract?.methods.processProposalPayment(proposalId).send()
    console.log('Process Proposal Payment transaction', transaction)

    await dispatch(showToaster(INFO, 'Process Proposal Payment round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    await dispatch(showToaster(SUCCESS, 'Process Proposal Payment confirmed', 'All good :)'))

    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch({
      type: PROCESS_PAYMENT_RESULT,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: PROCESS_PAYMENT_ERROR,
      error,
    })
  }
}
