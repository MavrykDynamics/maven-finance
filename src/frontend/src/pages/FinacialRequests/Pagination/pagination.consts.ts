export const COUNCIL_LIST_NAME = 'council'
export const COUNCIL_MY_PAST_ACTIONS_LIST_NAME = 'counsilMyPastActions'
export const COUNCIL_MY_ONGOING_ACTIONS_LIST_NAME = 'counsilMyOngoingActions'

export const EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME = 'emergencyGovHistory'
export const EMERGENCY_GOVERNANCE_ACTIVE_LIST_NAME = 'emergencyGovActive'

export const PAST_REQUESTS_FINANCIAL_REQUESTS_LIST = 'pastFR'
export const ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST = 'ongoingFR'

export const ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST = 'ongoingActionsSatellitesGov'
export const PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST = 'pastActionsSatellitesGov'
export const MY_ACTIONS_SATELLITE_GOVERNANCE_LIST = 'myActionsSatellitesGov'

export const SATELITES_OVERVIEW_LIST_NAME = 'saletitesGov'
export const SATELITES_TOP_LIST_NAME = 'topSatelitesOracle'
export const FEEDS_TOP_LIST_NAME = 'topDataFeedsOracle'
export const FEEDS_ALL_LIST_NAME = 'allDataFeedsOracle'
export const ORACLES_DATA_IN_FEED_LIST_NAME = 'oraclesDataFromFeed'
export const USER_DATA_FEEDS_LIST_NAME = 'userDataFeeds'
export const SATELITES_NODES_LIST_NAME = 'satelitesNodes'
export const SATELLITES_OVERVIEW_LIST_NAME = 'satellitesOverviewList'

export const WAITING_PROPOSALS_LIST_NAME = 'waitingProposals'
export const WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME = 'waitingFPProposals'
export const HISTORY_PROPOSALS_LIST_NAME = 'historyProposals'
export const ONGOING_PROPOSALS_LIST_NAME = 'ongoingProposals'
export const NEXT_PROPOSALS_LIST_NAME = 'nextProposals'
export const ONGOING_VOTING_PROPOSALS_LIST_NAME = 'ongoingVotingProposals'
export const GOVERNANCE_VOTERS_LIST_NAME = 'govVotets'

export const BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME = 'myPastCouncilActions'
export const BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME = 'pastBreakGlassCouncilActions'
export const BREAK_GLASS_MY_ONGOING_ACTIONS_LIST_NAME = 'breakGlassActionPendingMySignature'

export const FARMS_VERTICAL_CARDS = 'farmsVertical'
export const FARMS_HORIZONTAL_CARDS = 'farmsHorizontal'

export const BREAK_GLASS_LIST_NAME = 'breakGlass'

export const LIST_NAMES_MAPPER: Record<string, number> = {
  [COUNCIL_LIST_NAME]: 8,
  [COUNCIL_MY_PAST_ACTIONS_LIST_NAME]: 8,
  [COUNCIL_MY_ONGOING_ACTIONS_LIST_NAME]: 8,
  [EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME]: 5,
  [EMERGENCY_GOVERNANCE_ACTIVE_LIST_NAME]: 5,
  [PAST_REQUESTS_FINANCIAL_REQUESTS_LIST]: 5,
  [ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST]: 5,
  [ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST]: 7,
  [PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST]: 7,
  [MY_ACTIONS_SATELLITE_GOVERNANCE_LIST]: 7,
  [WAITING_PROPOSALS_LIST_NAME]: 10,
  [WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME]: 10,
  [HISTORY_PROPOSALS_LIST_NAME]: 10,
  [ONGOING_PROPOSALS_LIST_NAME]: 10,
  [GOVERNANCE_VOTERS_LIST_NAME]: 10,
  [NEXT_PROPOSALS_LIST_NAME]: 10,
  [ONGOING_VOTING_PROPOSALS_LIST_NAME]: 10,
  [SATELITES_TOP_LIST_NAME]: 3,
  [SATELITES_NODES_LIST_NAME]: 5,
  [FEEDS_TOP_LIST_NAME]: 5,
  [ORACLES_DATA_IN_FEED_LIST_NAME]: 5,
  [USER_DATA_FEEDS_LIST_NAME]: 3,
  [FEEDS_ALL_LIST_NAME]: 10,
  [SATELLITES_OVERVIEW_LIST_NAME]: 10,
  [BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME]: 8,
  [BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME]: 8,
  [BREAK_GLASS_MY_ONGOING_ACTIONS_LIST_NAME]: 8,
  [FARMS_VERTICAL_CARDS]: 9,
  [FARMS_HORIZONTAL_CARDS]: 12,
  [BREAK_GLASS_LIST_NAME]: 8,
}

export const calculateSlicePositions = (currentPage: number, listName: string) => {
  const itemsPerPage = LIST_NAMES_MAPPER[listName]
  return [(currentPage - 1) * itemsPerPage, currentPage * itemsPerPage]
}

export const getSatelliteGovernanceListName = (tabId: string) => {
  switch (tabId) {
    case 'past':
      return PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST
    case 'ongoing':
      return ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST
    case 'my':
    default:
      return MY_ACTIONS_SATELLITE_GOVERNANCE_LIST
  }
}

export const PAGINATION_SIDE_RIGHT = 'right'
export const PAGINATION_SIDE_LEFT = 'left'
