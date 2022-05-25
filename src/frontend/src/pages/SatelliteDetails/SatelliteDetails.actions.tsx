import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import storageToTypeConverter from '../../utils/storageToTypeConverter'
import {
  SATELLITE_RECORDS_QUERY,
  SATELLITE_RECORDS_QUERY_NAME,
  SATELLITE_RECORDS_QUERY_VARIABLES,
} from '../../gql/queries/getSatelliteRecords'

export const GET_SATELLITE_BY_ADDRESS = 'GET_SATELLITE_BY_ADDRESS'
export const getSatelliteByAddress = (satelliteAddress: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()
  console.log('%c ||||| satelliteAddress', 'color:yellowgreen', satelliteAddress)
  try {
    const satelliteRecordFromIndexer = await fetchFromIndexerWithPromise(
      SATELLITE_RECORDS_QUERY,
      SATELLITE_RECORDS_QUERY_NAME,
      SATELLITE_RECORDS_QUERY_VARIABLES(satelliteAddress),
    )
    console.log(satelliteRecordFromIndexer)
    const satelliteRecord = storageToTypeConverter('satelliteRecord', satelliteRecordFromIndexer?.satellite_record?.[0])
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
