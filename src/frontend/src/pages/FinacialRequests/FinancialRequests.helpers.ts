import qs, { ParsedQs } from 'qs'
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { GovernanceFinancialRequestGraphQL } from '../../utils/TypesAndInterfaces/Governance'

export const distinctRequestsByExecuting = (
  mixedUpRequests: GovernanceFinancialRequestGraphQL[],
): {
  ongoing: GovernanceFinancialRequestGraphQL[]
  past: GovernanceFinancialRequestGraphQL[]
} => {
  const ongoing: GovernanceFinancialRequestGraphQL[] = [],
    past: GovernanceFinancialRequestGraphQL[] = []
  if (!mixedUpRequests) return { ongoing, past }

  mixedUpRequests.forEach((request) => {
    if (request.executed || new Date(request.expiration_datetime as string).getTime() < +Date.now()) {
      past.push(request)
    } else {
      ongoing.push(request)
    }
  })
  return {
    ongoing,
    past,
  }
}

export const getPageNumber = (search: string, listName: string): number => {
  const { page = {} } = qs.parse(search, { ignoreQueryPrefix: true })
  return Number((page as Record<string, string>)?.[listName]) || 1
}

export const updatePageInUrl = ({
  page,
  newPage,
  listName,
  pathname,
  restQP,
}: {
  page: string | ParsedQs | string[] | ParsedQs[]
  newPage: number
  listName: string
  pathname: string
  restQP: object
}) => {
  const { [listName]: removedEl, ...newPageParams } = page as Record<string, string>

  if (Number(newPage) !== 1) {
    newPageParams[listName] = newPage.toString()
  }

  const newQueryParams = {
    ...restQP,
    page: newPageParams,
  }
  return pathname + qs.stringify(newQueryParams, { addQueryPrefix: true })
}

export const getRequestStatus = (request: GovernanceFinancialRequestGraphQL) => {
  if (!request.executed) {
    if (new Date(request.expiration_datetime as string).getTime() < +Date.now()) {
      return ProposalStatus.DEFEATED
    } else {
      return ProposalStatus.ONGOING
    }
  } else {
    return ProposalStatus.EXECUTED
  }
}
