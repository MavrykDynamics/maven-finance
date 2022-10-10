import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { FeedGQL } from './Satellites.types'

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
      const currentOracleFeeds = feeds.filter(({ admin }) => oracle.oracleRecords[0].oracleAddress === admin)

      // if timestamp or all feeds from this satellite is >= than 30m ago, feed is not active, if all feeds are not active oracle status is responded, if at least 1 feed is still active, satellite status is awaiting
      if (
        currentOracleFeeds.every(
          ({ last_completed_data_last_updated_at }) =>
            (Number(Date.now()) - Number(new Date(last_completed_data_last_updated_at || Date.now()))) / 1000 / 60 >=
            30,
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
