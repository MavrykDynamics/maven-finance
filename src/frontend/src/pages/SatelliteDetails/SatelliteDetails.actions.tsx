import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import storageToTypeConverter from '../../utils/storageToTypeConverter'
import {
  SATELLITE_RECORDS_QUERY,
  SATELLITE_RECORDS_QUERY_NAME,
  SATELLITE_RECORDS_QUERY_VARIABLES,
  USER_VOTING_HYSTORY_QUERY,
  USER_VOTING_HYSTORY_NAME,
  USER_VOTING_HYSTORY_VARIABLES,
} from '../../gql/queries/getSatelliteRecords'

export const GET_SATELLITE_BY_ADDRESS = 'GET_SATELLITE_BY_ADDRESS'
export const getSatelliteByAddress = (satelliteAddress: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()
  const oraclesIds = state.oracles.oraclesStorage.oraclesSatellitesIds.map(({ oracle_id }) => oracle_id)

  try {
    const satelliteRecordFromIndexer = await fetchFromIndexerWithPromise(
      SATELLITE_RECORDS_QUERY,
      SATELLITE_RECORDS_QUERY_NAME,
      SATELLITE_RECORDS_QUERY_VARIABLES(satelliteAddress),
    )

    const userVotingHistoryIndexer = await fetchFromIndexerWithPromise(
      USER_VOTING_HYSTORY_QUERY,
      USER_VOTING_HYSTORY_NAME,
      USER_VOTING_HYSTORY_VARIABLES(satelliteAddress),
    )

    const satelliteRecord = storageToTypeConverter('satelliteRecord', {
      satelliteRecordFromIndexer: satelliteRecordFromIndexer?.satellite_record?.[0],
      userVotingHistoryIndexer: userVotingHistoryIndexer?.mavryk_user?.[0],
    })

    satelliteRecord['isSatelliteOracle'] = false
    if (oraclesIds.includes(satelliteRecord.address)) {
      satelliteRecord['feeds'] = state.oracles.oraclesStorage.feeds.filter(
        (feed) => feed.admin === satelliteRecord.address,
      )
      satelliteRecord['isSatelliteOracle'] = true
    }

    dispatch({
      type: GET_SATELLITE_BY_ADDRESS,
      currentSatellite: satelliteRecord,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: GET_SATELLITE_BY_ADDRESS,
      error,
    })
  }
}
