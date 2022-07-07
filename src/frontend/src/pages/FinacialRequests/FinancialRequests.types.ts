import {PAGINATION_SIDE_RIGHT, PAGINATION_SIDE_LEFT} from './FinancialRequests.consts'

export type FinancialRequestBody = {
  executed: boolean
  expiration_datetime: string
  governance_financial_id: string
  id: number
  key_hash: null
  nay_vote_smvk_total: number
  pass_vote_smvk_total: number
  request_purpose: string
  request_type: string
  requested_datetime: string
  requester_id: string
  smvk_percentage_for_approval: number
  smvk_required_for_approval: number
  snapshot_smvk_total_supply: number
  status: number
  token_amount: number
  token_contract_address: string
  token_id: number
  token_name: string
  token_type: string
  treasury_id: string
  votes: Array<{
    governance_financial_request_id: number
    id: number
    timestamp: string
    vote: number
    voter_id: string
    voting_power: number
  }>
  yay_vote_smvk_total: number
}

export type FRListProps = {
  listTitle: string
  items: Array<FinancialRequestBody>
  noItemsText: string
  name: string
  handleItemSelect: (arg0: FinancialRequestBody) => void
  selectedItem?: FinancialRequestBody
}

export type FRListItemProps = {
  id: number
  title: string
  additionalText?: string
  onClickHandler?: () => void
  selected?: boolean
  dividedPassVoteMvkTotal?: number
  status: string
}

export type PaginationPlacementVariants = typeof PAGINATION_SIDE_RIGHT | typeof PAGINATION_SIDE_LEFT

export type PaginationProps = {
  itemsCount: number
  side?: PaginationPlacementVariants
  listName: string
}
