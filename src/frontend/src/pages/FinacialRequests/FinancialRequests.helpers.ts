import { FinancialRequestBody } from "./FinancialRequests.types"

export const distinctRequestsByExecuting = (mixedUpRequests: Array<FinancialRequestBody>): {
  ongoing: Array<FinancialRequestBody>,past : Array<FinancialRequestBody>
} => {
  const ongoing: Array<FinancialRequestBody> = [], past: Array<FinancialRequestBody> = []

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