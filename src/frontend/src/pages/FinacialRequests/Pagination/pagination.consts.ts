export const COUNSIL_LIST_NAME = 'counsil'
export const EMERGENCY_GOVERNANCE_LIST_NAME = 'emergencyGov'

export const PAST_REQUESTS_FINANCIAL_REQUESTS_LIST = 'pastFR'
export const ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST = 'ongoingFR'

export const ONGOING_ACTIONS_SATELITE_GOVERNANCE_LIST = 'ongoingActionsSatelitesGov'
export const PAST_ACTIONS_SATELITE_GOVERNANCE_LIST = 'pastActionsSatelitesGov'
export const MY_ACTIONS_SATELITE_GOVERNANCE_LIST = 'myActionsSatelitesGov'

export const SATELITES_OVERVIEW_LIST_NAME = 'saletitesGov'

export const WAITING_PROPOSALS_LIST_NAME = 'waitingProposals'
export const WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME = 'waitingFPProposals'
export const HISTORY_PROPOSALS_LIST_NAME = 'historyProposals'
export const ONGOING_PROPOSALS_LIST_NAME = 'ongoingProposals'
export const NEXT_PROPOSALS_LIST_NAME = 'nextProposals'
export const ONGOING_VOTING_PROPOSALS_LIST_NAME = 'ongoingVotingProposals'

export const LIST_NAMES_MAPPER: Record<string, number> = {
  [COUNSIL_LIST_NAME]:  10,
  [EMERGENCY_GOVERNANCE_LIST_NAME]: 5,
  [PAST_REQUESTS_FINANCIAL_REQUESTS_LIST]: 5,
  [ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST]: 5,
  [ONGOING_ACTIONS_SATELITE_GOVERNANCE_LIST]: 7,
  [PAST_ACTIONS_SATELITE_GOVERNANCE_LIST]: 7,
  [MY_ACTIONS_SATELITE_GOVERNANCE_LIST]: 7,
  [WAITING_PROPOSALS_LIST_NAME]: 10,
  [WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME]: 10,
  [HISTORY_PROPOSALS_LIST_NAME]: 10,
  [ONGOING_PROPOSALS_LIST_NAME]: 10,
  [NEXT_PROPOSALS_LIST_NAME]: 10,
  [ONGOING_VOTING_PROPOSALS_LIST_NAME]: 10,
}

export const calculateSlicePositions = (currentPage: number, listName: string) => {
  const itemsPerPage = LIST_NAMES_MAPPER[listName]
  return [(currentPage - 1) * itemsPerPage, currentPage * itemsPerPage]
}

export const getSateliteGovernanceListName = (tabId: string) => {
  switch(tabId){
    case 'past':
      return PAST_ACTIONS_SATELITE_GOVERNANCE_LIST;
    case 'ongoing':
      return ONGOING_ACTIONS_SATELITE_GOVERNANCE_LIST;
    case 'my':
    default:
      return MY_ACTIONS_SATELITE_GOVERNANCE_LIST
  }
}

export const PAGINATION_SIDE_RIGHT = 'right'
export const PAGINATION_SIDE_LEFT = 'left'