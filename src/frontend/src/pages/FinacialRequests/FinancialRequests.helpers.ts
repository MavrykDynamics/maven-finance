import qs from 'qs'
import moment from 'moment'
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { GovernanceFinancialRequestRecordGraphQL } from '../../utils/TypesAndInterfaces/Governance'

export const distinctRequestsByExecuting = (
  mixedUpRequests: GovernanceFinancialRequestRecordGraphQL[],
): {
  ongoing: GovernanceFinancialRequestRecordGraphQL[]
  past: GovernanceFinancialRequestRecordGraphQL[]
} => {
  const ongoing: GovernanceFinancialRequestRecordGraphQL[] = [],
    past: GovernanceFinancialRequestRecordGraphQL[] = []
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
  page: any
  newPage: number
  listName: string
  pathname: string
  restQP: any
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

export const getRequestStatus = (request: GovernanceFinancialRequestRecordGraphQL) => {
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

export const getDate_MDHMTZ_Format = (time: string) => moment(new Date(time)).format('MMMM Do hh:mm Z')
export const getDate_MDY_Format = (time: string) => moment(new Date(time)).format('MMM Do, Y')
export const getDate_MDHMS_Format = ({ time, timestamp }: { time?: string; timestamp?: number }) =>
  moment(time ? new Date(time) : timestamp || Date.now()).format('MMM Do, HH:MM:SS')
