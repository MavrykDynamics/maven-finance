import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import {
  SATELLITE_RECORDS_QUERY,
  SATELLITE_RECORDS_QUERY_NAME,
  SATELLITE_RECORDS_QUERY_VARIABLES,
  USER_VOTING_HYSTORY_QUERY,
  USER_VOTING_HYSTORY_NAME,
  USER_VOTING_HYSTORY_VARIABLES,
} from '../../gql/queries/getSatelliteRecords'
import { normalizeSatelliteRecord } from '../../pages/Satellites/Satellites.helpers'
import type { AppDispatch, GetState } from '../../app/App.controller'

export const GET_SATELLITE_BY_ADDRESS = 'GET_SATELLITE_BY_ADDRESS'

export const getSatelliteByAddress =
  (satelliteAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
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

      const satelliteRecord = normalizeSatelliteRecord(
        satelliteRecordFromIndexer?.satellite_record?.[0],
        userVotingHistoryIndexer?.mavryk_user?.[0],
      )

      dispatch({
        type: GET_SATELLITE_BY_ADDRESS,
        currentSatellite: satelliteRecord,
      })
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: GET_SATELLITE_BY_ADDRESS,
          error,
        })
      }
    }
  }
