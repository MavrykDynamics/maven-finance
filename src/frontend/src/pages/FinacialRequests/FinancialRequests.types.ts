import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { PAGINATION_SIDE_LEFT, PAGINATION_SIDE_RIGHT } from './Pagination/pagination.consts'

import { GovernanceFinancialRequestGraphQL } from '../../utils/TypesAndInterfaces/Governance'

export type FinancialRequestBody = GovernanceFinancialRequestGraphQL

export type FRListProps = {
  listTitle: string
  items: Array<FinancialRequestBody>
  noItemsText?: string
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
  status: ProposalStatus
}

export type PaginationPlacementVariants = typeof PAGINATION_SIDE_RIGHT | typeof PAGINATION_SIDE_LEFT

export type PaginationProps = {
  itemsCount: number
  side?: PaginationPlacementVariants
  listName: string
}
