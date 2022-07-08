import qs from "qs"
import moment from "moment"
import { ProposalStatus } from "utils/TypesAndInterfaces/Governance"
import { FinancialRequestBody } from "./FinancialRequests.types"

export const distinctRequestsByExecuting = (mixedUpRequests: Array<FinancialRequestBody>): {
  ongoing: Array<FinancialRequestBody>,past : Array<FinancialRequestBody>
} => {
  const ongoing: Array<FinancialRequestBody> = [], past: Array<FinancialRequestBody> = []
  if(!mixedUpRequests) return { ongoing, past }

  mixedUpRequests.forEach(request => {
    if(request.executed){
      past.push(request)
    }else {
      ongoing.push(request)
    }
  })
  return {
    ongoing, past
  }
}

export const getPageNumber = (search: string, listName: string): number => {
  const { page = {} } = qs.parse(search, { ignoreQueryPrefix: true })
  return Number((page as Record<string, string>)?.[listName]) || 1
}

export const updatePageInUrl = ({page, newPage, listName, pathname, restQP}: {page: any, newPage: number, listName: string, pathname: string, restQP: any}) => {
  const newPageParams = {
    ...(page as Record<string, string>),
    [listName]: newPage,
  }

  if (newPage === 1) delete newPageParams[listName]

  const newQueryParams = {
    ...restQP,
    page: newPageParams,
  }
  return pathname + qs.stringify(newQueryParams, { addQueryPrefix: true })
}

export const getRequestStatus = (request: FinancialRequestBody) => {
  if(!request.executed) {
    if (new Date(request.expiration_datetime).getTime() < +Date.now()) {
      return  ProposalStatus.ONGOING
    } else {
      return  ProposalStatus.DEFEATED
    }
  } else {
    return  ProposalStatus.EXECUTED
  }
}

export const getDate_MDHMTZ_Format = (time: string) => moment(new Date(time)).format("MMMM Do hh:mm Z")


