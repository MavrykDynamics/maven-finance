import { State } from '../../reducers'
import governanceAddress from '../../deployments/governanceAddress.json'
import emergencyGovernanceAddress from '../../deployments/emergencyGovernanceAddress.json'
import { TezosToolkit } from '@taquito/taquito'
import { getContractBigmapKeys } from '../../utils/api'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { HIDE_EXIT_FEE_MODAL } from '../Doorman/ExitFeeModal/ExitFeeModal.actions'
import { GovernanceStorage } from '../../utils/TypesAndInterfaces/Governance'

export const GET_GOVERNANCE_STORAGE = 'GET_GOVERNANCE_STORAGE'
export const getGovernanceStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(governanceAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(governanceAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Governance storage:\n', storage)
  const proposalLedgerBigMap = await getContractBigmapKeys(governanceAddress.address, 'proposalLedger')
  const snapshotLedgerBigMap = await getContractBigmapKeys(governanceAddress.address, 'snapshotLedger')
  const financialRequestLedgerBigMap = await getContractBigmapKeys(governanceAddress.address, 'financialRequestLedger')
  const financialRequestSnapshotLedgerBigMap = await getContractBigmapKeys(
    governanceAddress.address,
    'financialRequestSnapshotLedger',
  )
  const governanceLambdaLedgerBigMap = await getContractBigmapKeys(governanceAddress.address, 'governanceLambdaLedger')

  const governanceStorage: GovernanceStorage = {
    admin: storage.admin,
    config: {
      successReward: storage.config.successReward.toNumber(),
      minQuorumPercentage: storage.config.minQuorumPercentage,
      minQuorumMvkTotal: storage.config.minQuorumPercentage,
      votingPowerRatio: storage.config.votingPowerRatio,
      proposalSubmissionFee: storage.config.proposalSubmissionFee, // 10 tez
      minimumStakeReqPercentage: storage.config.minimumStakeReqPercentage, // 0.01% for testing: change to 10,000 later -> 10%
      maxProposalsPerDelegate: storage.config.maxProposalsPerDelegate,
      newBlockTimeLevel: storage.config.newBlockTimeLevel,
      newBlocksPerMinute: storage.config.newBlocksPerMinute,
      blocksPerMinute: storage.config.blocksPerMinute,
      blocksPerProposalRound: storage.config.blocksPerProposalRound,
      blocksPerVotingRound: storage.config.blocksPerVotingRound,
      blocksPerTimelockRound: storage.config.blocksPerTimelockRound,
    },
    whitelistContracts: storage.whitelistContracts,
    whitelistTokenContracts: storage.whitelistTokenContracts,
    generalContracts: storage.generalContracts,
    proposalLedger: proposalLedgerBigMap,
    snapshotLedger: snapshotLedgerBigMap,
    activeSatellitesMap: storage.activeSatellitesMap,
    startLevel: storage.startLevel.toNumber(),
    nextProposalId: storage.nextProposalId.toNumber(),
    currentRound: storage.currentRound,
    currentRoundStartLevel: storage.currentRoundStartLevel.toNumber(),
    currentRoundEndLevel: storage.currentRoundEndLevel.toNumber(),
    currentCycleEndLevel: storage.currentCycleEndLevel.toNumber(),
    currentRoundProposals: storage.currentRoundProposals,
    currentRoundVotes: storage.currentRoundVotes,
    currentRoundHighestVotedProposalId: storage.currentRoundHighestVotedProposalId.toNumber(),
    timelockProposalId: storage.timelockProposalId.toNumber(),
    snapshotMvkTotalSupply: storage.snapshotMvkTotalSupply.toNumber(),
    governanceLambdaLedger: governanceLambdaLedgerBigMap,
    financialRequestLedger: financialRequestLedgerBigMap,
    financialRequestSnapshotLedger: financialRequestSnapshotLedgerBigMap,
    financialRequestCounter: storage.financialRequestCounter.toNumber(),
    tempFlag: storage.tempFlag.toNumber(),
  }
  console.log(governanceStorage.currentRound)
  dispatch({
    type: GET_GOVERNANCE_STORAGE,
    governanceStorage: governanceStorage,
  })
}

export const GET_EMERGENCY_GOVERNANCE_STORAGE = 'GET_EMERGENCY_GOVERNANCE_STORAGE'
export const SET_EMERGENCY_GOVERNANCE_ACTIVE = 'SET_EMERGENCY_GOVERNANCE_ACTIVE'
export const SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV = 'SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV'
export const getEmergencyGovernanceStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(emergencyGovernanceAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(emergencyGovernanceAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Emergency Governance storage:\n', storage)
  const currentEmergencyGovernanceId = storage.currentEmergencyGovernanceId

  dispatch({
    type: SET_EMERGENCY_GOVERNANCE_ACTIVE,
    emergencyGovActive: currentEmergencyGovernanceId.toNumber() !== 0,
  })
  dispatch({
    type: GET_EMERGENCY_GOVERNANCE_STORAGE,
    emergencyGovernanceStorage: storage,
  })
}

export const VOTING_REQUEST = 'VOTING_REQUEST'
export const VOTING_RESULT = 'VOTING_REQUEST'
export const VOTING_ERROR = 'VOTING_REQUEST'
export const VoteOnProposal = (vote: number) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const contract = await state.wallet.tezos?.wallet.at(governanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.vote(vote).send()
    console.log('transaction', transaction)

    dispatch({
      type: VOTING_REQUEST,
      vote,
    })
    dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))
    dispatch({
      type: HIDE_EXIT_FEE_MODAL,
    })

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))

    dispatch({
      type: VOTING_RESULT,
    })

    dispatch(getGovernanceStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: VOTING_ERROR,
      error,
    })
  }
}
