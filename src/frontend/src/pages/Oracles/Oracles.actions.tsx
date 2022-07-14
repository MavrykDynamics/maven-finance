import { State } from 'reducers'

export const GET_ORACLES_STORAGE = 'GET_ORACLES_STORAGE'

//getOracleSatellites
export const GET_ORACLES_SATELLITES = 'GET_ORACLES_SATELLITES'
export const getOracleSatellites = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const oracleSatellitesFull = state.oracles.oraclesStorage.oraclesSatellitesIds
    .map(({ oracle_id }) => {
      const satelliteData = state.delegation.delegationStorage.satelliteLedger.find(
        (satellite) => satellite.address === oracle_id,
      )
      if (satelliteData) {
        satelliteData['feeds'] = state.oracles.oraclesStorage.feeds.filter(
          (feed) => feed.admin === satelliteData.address,
        )
      }
      return satelliteData || null
    })
    .filter(Boolean)

  dispatch({
    type: GET_ORACLES_SATELLITES,
    oracleSatellitesFull,
  })
}
