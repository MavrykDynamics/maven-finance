import { Dispatch } from 'redux'

// types
import type { EmergencyGovernanceStorage } from '../utils/TypesAndInterfaces/EmergencyGovernance'

import { getInitialData } from '../gql/fetchGraphQL'

import { GET_DOORMAN_STORAGE, GET_MVK_TOKEN_STORAGE } from '../pages/Doorman/Doorman.actions'
import { GET_DELEGATION_STORAGE, GET_ORACLES_STORAGE } from '../pages/Satellites/Satellites.actions'
import { GET_FARM_STORAGE } from '../pages/Farms/Farms.actions'
import {
  GET_EMERGENCY_GOVERNANCE_STORAGE,
  SET_EMERGENCY_GOVERNANCE_ACTIVE,
} from '../pages/EmergencyGovernance/EmergencyGovernance.actions'
import { GET_BREAK_GLASS_STORAGE, SET_GLASS_BROKEN } from '../pages/BreakGlass/BreakGlass.actions'
import { GET_VESTING_STORAGE } from '../pages/Treasury/Treasury.actions'
import { GET_COUNCIL_STORAGE } from '../pages/Council/Council.actions'
import {
  GET_GOVERNANCE_STORAGE,
  SET_GOVERNANCE_PHASE,
  SET_PAST_PROPOSALS,
} from '../pages/Governance/Governance.actions'
import { GET_BREAK_GLASS_ACTION } from 'pages/BreakGlassActions/BreakGlassActions.actions'
import { GET_PAST_BREAK_GLASS_COUNCIL_ACTION, GET_BREAK_GLASS_COUNCIL_MEMBER } from 'pages/BreakGlassCouncil/BreakGlassCouncil.actions'

// helpers
import { normalizeAddressesStorage, normalizeVestingStorage, normalizeOracle } from './App.helpers'
import { normalizeDoormanStorage, normalizeMvkToken } from '../pages/Doorman/Doorman.converter'
import { getEndsInTimestampForFarmCards, getLPTokensInfo, normalizeFarmStorage } from '../pages/Farms/Frams.helpers'
import { normalizeDelegationStorage } from '../pages/Satellites/Satellites.helpers'
import { normalizeEmergencyGovernance } from '../pages/EmergencyGovernance/EmergencyGovernance.helpers'
import { normalizeBreakGlass } from '../pages/BreakGlass/BreakGlass.helpers'
import { noralizeCouncilStorage } from '../pages/Council/Council.helpers'
import { normalizeGovernanceStorage } from '../pages/Governance/Governance.helpers'
import { normalizeBreakGlassAction } from 'pages/BreakGlassActions/BreakGlassActions.helpers'
import { normalizeBreakGlassCouncilMember } from 'pages/BreakGlassCouncil/BreakGlassCouncil.helpers'

export const RECAPTCHA_REQUEST = 'RECAPTCHA_REQUEST'
export const recaptchaRequest = () => (dispatch: Dispatch) => {
  dispatch({
    type: RECAPTCHA_REQUEST,
  })
}

/**
 * Function that gets all initial data from the Indexer and adds it to the redux state and localstorage
 */
export const onStart = () => async (dispatch: Dispatch) => {
  const res = await getInitialData()
  console.log('%c res onStart getInitialData()', 'color:gold', res)

  const addressesStorage = normalizeAddressesStorage(res[0])
  const mvkTokenStorage = normalizeMvkToken(res[1]?.mvk_token[0])
  const doormanStorage = normalizeDoormanStorage(res[2]?.doorman[0])
  const delegationStorage = normalizeDelegationStorage(res[3]?.delegation[0])
  const farmStorage = await normalizeFarmStorage(res[4]?.farm)
  const emergencyGovernanceStorage: EmergencyGovernanceStorage = normalizeEmergencyGovernance(
    res[5]?.emergency_governance[0],
  )
  const breakGlassStorage = normalizeBreakGlass(res[6]?.break_glass[0])
  const councilStorage = noralizeCouncilStorage(res[7]?.council?.[0])
  const vestingStorage = normalizeVestingStorage(res[8]?.vesting[0])
  const governanceStorage = normalizeGovernanceStorage(res[9])
  const oraclesStorage = normalizeOracle(res[10])
  const breakGlassCouncilMember = normalizeBreakGlassCouncilMember(res[11])
  const breakGlassAction = normalizeBreakGlassAction(res[12])
  const pastBreakGlassCouncilAction = normalizeBreakGlassAction(res[13])

  const currentEmergencyGovernanceId = emergencyGovernanceStorage.currentEmergencyGovernanceRecordId
  dispatch({
    type: SET_EMERGENCY_GOVERNANCE_ACTIVE,
    emergencyGovActive: currentEmergencyGovernanceId !== 0,
  })
  dispatch({
    type: SET_GLASS_BROKEN,
    glassBroken: breakGlassStorage.glassBroken,
  })

  dispatch({
    type: SET_GOVERNANCE_PHASE,
    phase: governanceStorage.currentRound,
  })

  //dispatching all the different actions into the redux
  dispatch({ type: GET_CONTRACT_ADDRESSES, addresses: addressesStorage })

  dispatch({
    type: GET_DOORMAN_STORAGE,
    storage: doormanStorage,
    totalStakedMvkSupply: doormanStorage.totalStakedMvk,
  })
  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: mvkTokenStorage,
  })
  dispatch({
    type: GET_DELEGATION_STORAGE,
    delegationStorage: delegationStorage,
  })
  dispatch({
    type: GET_FARM_STORAGE,
    farmStorage: farmStorage,
  })
  dispatch({
    type: GET_EMERGENCY_GOVERNANCE_STORAGE,
    emergencyGovernanceStorage: emergencyGovernanceStorage,
  })
  dispatch({
    type: GET_BREAK_GLASS_STORAGE,
    breakGlassStorage: breakGlassStorage,
  })
  dispatch({
    type: GET_COUNCIL_STORAGE,
    councilStorage: councilStorage,
  })
  dispatch({
    type: GET_VESTING_STORAGE,
    vestingStorage: vestingStorage,
  })
  dispatch({
    type: GET_GOVERNANCE_STORAGE,
    governanceStorage: governanceStorage,
  })

  dispatch({
    type: SET_PAST_PROPOSALS,
    pastProposals: governanceStorage.proposalLedger,
  })
  dispatch({
    type: GET_ORACLES_STORAGE,
    oraclesStorage,
  })
  dispatch({
    type: GET_BREAK_GLASS_COUNCIL_MEMBER,
    breakGlassCouncilMember,
  })
  dispatch({ 
    type: GET_BREAK_GLASS_ACTION,
    breakGlassAction,
  })
  dispatch({
    type: GET_PAST_BREAK_GLASS_COUNCIL_ACTION,
    pastBreakGlassCouncilAction,
  })
}

export const GET_CONTRACT_ADDRESSES = 'GET_CONTRACT_ADDRESSES'
