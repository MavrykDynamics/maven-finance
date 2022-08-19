import { showToaster } from "app/App.components/Toaster/Toaster.actions";
import {
  ERROR,
  INFO,
  SUCCESS,
} from "app/App.components/Toaster/Toaster.constants";
import { State } from "reducers";
import { fetchFromIndexerWithPromise } from "../../gql/fetchGraphQL";
import storageToTypeConverter from "../../utils/storageToTypeConverter";
import {
  SATELLITE_RECORDS_QUERY,
  SATELLITE_RECORDS_QUERY_NAME,
  SATELLITE_RECORDS_QUERY_VARIABLES,
  USER_VOTING_HYSTORY_QUERY,
  USER_VOTING_HYSTORY_NAME,
  USER_VOTING_HYSTORY_VARIABLES,
} from "../../gql/queries/getSatelliteRecords";
import { normalizeSatelliteRecord } from "../../pages/Satellites/Satellites.helpers";

export const GET_SATELLITE_BY_ADDRESS = "GET_SATELLITE_BY_ADDRESS";

export const getSatelliteByAddress =
  (satelliteAddress: string) => async (dispatch: any, getState: any) => {
    try {
      const satelliteRecordFromIndexer = await fetchFromIndexerWithPromise(
        SATELLITE_RECORDS_QUERY,
        SATELLITE_RECORDS_QUERY_NAME,
        SATELLITE_RECORDS_QUERY_VARIABLES(satelliteAddress)
      );

      const userVotingHistoryIndexer = await fetchFromIndexerWithPromise(
        USER_VOTING_HYSTORY_QUERY,
        USER_VOTING_HYSTORY_NAME,
        USER_VOTING_HYSTORY_VARIABLES(satelliteAddress)
      );

      const satelliteRecord = storageToTypeConverter("satelliteRecord", {
        satelliteRecordFromIndexer:
          satelliteRecordFromIndexer?.satellite_record?.[0],
        userVotingHistoryIndexer: userVotingHistoryIndexer?.mavryk_user?.[0],
      });

      console.log(
        "%c ||||| satelliteRecord",
        "color:yellowgreen",
        satelliteRecord
      );

      const satelliteRecord2 = normalizeSatelliteRecord(
        satelliteRecordFromIndexer?.satellite_record?.[0],
        userVotingHistoryIndexer?.mavryk_user?.[0]
      );

      console.log(
        "%c ||||| satelliteRecord2",
        "color:yellowgreen",
        satelliteRecord2
      );

      dispatch({
        type: GET_SATELLITE_BY_ADDRESS,
        currentSatellite: satelliteRecord,
      });
    } catch (error: any) {
      console.error(error);
      dispatch(showToaster(ERROR, "Error", error.message));
      dispatch({
        type: GET_SATELLITE_BY_ADDRESS,
        error,
      });
    }
  };
