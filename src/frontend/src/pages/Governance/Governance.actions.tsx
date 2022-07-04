import { MichelsonMap, TezosToolkit } from '@taquito/taquito'

import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import governanceAddress from '../../deployments/governanceAddress.json'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import { COUNCIL_STORAGE_QUERY, COUNCIL_STORAGE_QUERY_NAME, COUNCIL_STORAGE_QUERY_VARIABLE } from '../../gql/queries'

import {
  GOVERNANCE_STORAGE_QUERY,
  GOVERNANCE_STORAGE_QUERY_NAME,
  GOVERNANCE_STORAGE_QUERY_VARIABLE,
  CURRENT_ROUND_PROPOSALS_QUERY,
  CURRENT_ROUND_PROPOSALS_QUERY_NAME,
  CURRENT_ROUND_PROPOSALS_QUERY_VARIABLE,
} from '../../gql/queries/getGovernanceStorage'
import { State } from '../../reducers'
import { getContractBigmapKeys } from '../../utils/api'
import storageToTypeConverter, { convertCurrentRoundProposalsStorageType } from '../../utils/storageToTypeConverter'
import { GovernanceStorage, ProposalRecordType, SnapshotRecordType } from '../../utils/TypesAndInterfaces/Governance'
import { GET_COUNCIL_STORAGE } from '../Treasury/Treasury.actions'

export const SET_GOVERNANCE_PHASE = 'SET_GOVERNANCE_PHASE'
export const GET_GOVERNANCE_STORAGE = 'GET_GOVERNANCE_STORAGE'
export const SET_PAST_PROPOSALS = 'SET_PAST_PROPOSALS'
export const getGovernanceStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const storage = await fetchFromIndexer(
    GOVERNANCE_STORAGE_QUERY,
    GOVERNANCE_STORAGE_QUERY_NAME,
    GOVERNANCE_STORAGE_QUERY_VARIABLE,
  )

  const convertedStorage = storageToTypeConverter('governance', storage)

  dispatch({
    type: GET_GOVERNANCE_STORAGE,
    governanceStorage: convertedStorage,
  })

  dispatch({
    type: SET_GOVERNANCE_PHASE,
    phase: convertedStorage.currentRound,
  })
  dispatch({ type: SET_PAST_PROPOSALS, pastProposals: convertedStorage.proposalLedger })
}

export const GET_CURRENT_ROUND_PROPOSALS = 'GET_CURRENT_ROUND_PROPOSALS'
export const getCurrentRoundProposals = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const storage = await fetchFromIndexer(
    CURRENT_ROUND_PROPOSALS_QUERY,
    CURRENT_ROUND_PROPOSALS_QUERY_NAME,
    CURRENT_ROUND_PROPOSALS_QUERY_VARIABLE,
  )

  const currentRoundProposals = convertCurrentRoundProposalsStorageType(storage)

  dispatch({
    type: GET_CURRENT_ROUND_PROPOSALS,
    currentRoundProposals,
  })
}

export const PROPOSAL_ROUND_VOTING_REQUEST = 'PROPOSAL_ROUND_VOTING_REQUEST'
export const PROPOSAL_ROUND_VOTING_RESULT = 'PROPOSAL_ROUND_VOTING_RESULT'
export const PROPOSAL_ROUND_VOTING_ERROR = 'PROPOSAL_ROUND_VOTING_ERROR'
export const proposalRoundVote = (proposalId: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.proposalRoundVote(proposalId).send()
    console.log('transaction', transaction)

    dispatch({
      type: PROPOSAL_ROUND_VOTING_REQUEST,
      proposalId: proposalId,
    })
    dispatch(showToaster(INFO, 'Proposal Vote executing...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))

    dispatch({
      type: PROPOSAL_ROUND_VOTING_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: PROPOSAL_ROUND_VOTING_ERROR,
      error,
    })
  }
}

export const VOTING_ROUND_VOTING_REQUEST = 'VOTING_ROUND_VOTING_REQUEST'
export const VOTING_ROUND_VOTING_RESULT = 'VOTING_ROUND_VOTING_RESULT'
export const VOTING_ROUND_VOTING_ERROR = 'VOTING_ROUND_VOTING_ERROR'
export const votingRoundVote = (vote: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.votingRoundVote(vote).send()
    console.log('transaction', transaction)

    dispatch({
      type: VOTING_ROUND_VOTING_REQUEST,
      vote: vote,
    })
    dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))

    dispatch({
      type: VOTING_ROUND_VOTING_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: VOTING_ROUND_VOTING_ERROR,
      error,
    })
  }
}

// export const START_PROPOSAL_ROUND_REQUEST = 'START_PROPOSAL_ROUND_REQUEST'
// export const START_PROPOSAL_ROUND_RESULT = 'START_PROPOSAL_ROUND_RESULT'
// export const START_PROPOSAL_ROUND_ERROR = 'START_PROPOSAL_ROUND_ERROR'

export const START_PROPOSAL_ROUND_REQUEST = 'START_PROPOSAL_ROUND_REQUEST'
export const START_PROPOSAL_ROUND_RESULT = 'VOTING_ROUND_VOTING_RESULT'
export const START_PROPOSAL_ROUND_ERROR = 'VOTING_ROUND_VOTING_ERROR'
export const startProposalRound = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.startProposalRound().send()
    console.log('transaction', transaction)

    dispatch({
      type: START_PROPOSAL_ROUND_REQUEST,
    })
    dispatch(showToaster(INFO, 'Request Proposal round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    dispatch({
      type: START_PROPOSAL_ROUND_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: START_PROPOSAL_ROUND_ERROR,
      error,
    })
  }
}

export const START_VOTING_ROUND_REQUEST = 'START_VOTING_ROUND_REQUEST'
export const START_VOTING_ROUND_RESULT = 'START_VOTING_ROUND_RESULT'
export const START_VOTING_ROUND_ERROR = 'START_VOTING_ROUND_ERROR'
export const startVotingRound = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.startProposalRound().send()
    console.log('transaction', transaction)

    dispatch({
      type: START_VOTING_ROUND_REQUEST,
    })
    dispatch(showToaster(INFO, 'Request Voting round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    dispatch({
      type: START_VOTING_ROUND_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: START_VOTING_ROUND_ERROR,
      error,
    })
  }
}

export const getTimestampByLevel = async (level: number): Promise<string> => {
  if (level) {
    try {
      const result = await fetch(`https://api.ithacanet.tzkt.io/v1/blocks/${level}/`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json',
        },
      })
      const res = await result.json()
      return res.timestamp
    } catch (error: any) {
      console.error('getTimestampByLevel', error)
    }
  }
  return ''
}

export const START_NEXT_ROUND_ERROR = 'START_NEXT_ROUND_ERROR'
export const startNextRound = (executePastProposal: boolean) => async (dispatch: any, getState: any) => {
  const state: State = getState()
  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('startNextRound contract', contract)
    console.log('%c ||||| executePastProposal', 'color:yellowgreen', executePastProposal)
    const transaction = await contract?.methods.startNextRound(executePastProposal).send()
    console.log('startNextRound transaction', transaction)

    dispatch({
      type: START_NEXT_ROUND_ERROR,
    })
    dispatch(showToaster(INFO, 'Request Next round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    dispatch({
      type: START_NEXT_ROUND_ERROR,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: START_NEXT_ROUND_ERROR,
      error,
    })
  }
}

export const executeProposal = (proposalId: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()
  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    console.log('Execute Proposal contract', contract)
    const transaction = await contract?.methods.processProposalPayment(proposalId).send()
    console.log('Execute Proposal transaction', transaction)

    dispatch({
      type: START_NEXT_ROUND_ERROR,
    })
    dispatch(showToaster(INFO, 'Request Execute Proposal round start...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))

    dispatch({
      type: START_NEXT_ROUND_ERROR,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: START_NEXT_ROUND_ERROR,
      error,
    })
  }
}
