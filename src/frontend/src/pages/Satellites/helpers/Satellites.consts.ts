import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { FeedGQL } from './Satellites.types'

export const QUESTION_MARK_SVG_ENCODED = `background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 11.25C8.8995 11.25 11.25 8.8995 11.25 6C11.25 3.10051 8.8995 0.75 6 0.75C3.10051 0.75 0.75 3.10051 0.75 6C0.75 8.8995 3.10051 11.25 6 11.25ZM6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12Z' fill='%238D86EB'/%3E%3Cpath d='M5.3921 6.63229H6.2961V5.89629C7.1601 5.70429 7.7681 5.06429 7.7681 4.34429C7.7681 3.47229 7.0641 2.80829 6.0081 2.80829C5.2161 2.80829 4.6001 3.17629 4.1521 3.68829L4.7361 4.28029C5.0321 3.95229 5.4081 3.70429 5.8721 3.70429C6.4161 3.70429 6.7681 4.04829 6.7681 4.44029C6.7681 4.86429 6.2001 5.20029 5.3921 5.24829V6.63229ZM5.8481 8.49629C6.1841 8.49629 6.4641 8.20829 6.4641 7.85629C6.4641 7.52829 6.1841 7.24029 5.8481 7.24029C5.4801 7.24029 5.2081 7.52829 5.2081 7.85629C5.2081 8.20829 5.4801 8.49629 5.8481 8.49629Z' fill='%238D86EB'/%3E%3C/svg%3E%0A");`
export const INFO_SVG_ENCODED = `background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 11.25C8.8995 11.25 11.25 8.8995 11.25 6C11.25 3.10051 8.8995 0.75 6 0.75C3.10051 0.75 0.75 3.10051 0.75 6C0.75 8.8995 3.10051 11.25 6 11.25ZM6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12Z' fill='%238D86EB'/%3E%3Cpath d='M7.0498 8.34985H6.5998V5.19986C6.5998 4.95109 6.39829 4.74986 6.1498 4.74986H5.2498C5.00132 4.74986 4.7998 4.95109 4.7998 5.19986C4.7998 5.44862 5.00132 5.6372 5.2498 5.6372H5.6998V8.3372H5.2498C5.00132 8.3372 4.7998 8.53843 4.7998 8.7872C4.7998 9.03596 5.00132 9.2372 5.2498 9.2372H7.0498C7.29829 9.2372 7.4998 9.03596 7.4998 8.7872C7.4998 8.53843 7.29871 8.34985 7.0498 8.34985ZM6.1498 3.84986C6.5226 3.84986 6.8248 3.54766 6.8248 3.17486C6.8248 2.80206 6.52246 2.5 6.1498 2.5C5.77715 2.5 5.4748 2.8022 5.4748 3.175C5.4748 3.5478 5.77701 3.84986 6.1498 3.84986Z' fill='%238D86EB'/%3E%3C/svg%3E%0A");`

export const ORACLE_STATUSES_MAPPER = {
  responded: 'Responded',
  noResponse: 'No Response',
  awaiting: 'Awaiting',
}

export function checkIfUserIsSatellite(accountPkh?: string, satelliteLedger?: SatelliteRecord[]): boolean {
  return accountPkh && satelliteLedger ? satelliteLedger.some((record) => record.address === accountPkh) : false
}

export function getTotalDelegatedMVK(satelliteLedger: SatelliteRecord[]): number {
  if (!satelliteLedger) return 0
  return satelliteLedger.reduce((sum, current) => sum + Number(current.totalDelegatedAmount + current.sMvkBalance), 0)
}

export const getOracleStatus = (oracle: SatelliteRecord, feeds: FeedGQL[]): 'responded' | 'noResponse' | 'awaiting' => {
  let status: 'responded' | 'noResponse' | 'awaiting' = 'noResponse'

  // check if satellite is an oracle
  if (oracle?.oracleRecords?.length > 0) {
    // check whether oracle is active, if true status can be responded or awaiting
    if (oracle.oracleRecords.every(({ active }) => active)) {
      const currentOracleFeeds = feeds.filter(({ admin }) => oracle.oracleRecords[0].oracle_id === admin)

      // if timestamp or all feeds from this satellite is >= than 30m ago, feed is not active, if all feeds are not active oracle status is responded, if at least 1 feed is still active, satellite status is awaiting
      if (
        currentOracleFeeds.every(
          ({ last_completed_price_datetime }) =>
            (Number(Date.now()) - Number(new Date(last_completed_price_datetime || Date.now()))) / 1000 / 60 >= 30,
        )
      ) {
        status = 'responded'
      } else {
        status = 'awaiting'
      }
    }
  }

  return status
}
