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


export const getPageNumber = (paramsPage?: string): number =>
  paramsPage ? +paramsPage.split('-')[1] : 1;

  export function replacePageNumber({
    base,
    currentPage,
    newPage,
    listName,
    numberClear = false,
  }: {
    base: string;
    listName: string;
    currentPage: number;
    newPage: number;
    numberClear?: boolean;
  }) {
    const [url = '', params = ''] = base.split('?');
    if (!base.includes('page')) {
      return `${url}${url.endsWith('/') ? '' : '/'}?page=${`${listName}|${newPage}`}&${params ? `${params}` : ''}`;
    }
    return base.replace(`page=${`${listName}|${currentPage}`}`, numberClear ? '' : `page=${`${listName}|${newPage.toString()}`}`);
  }

export const ITEMS_PER_PAGE = 1

