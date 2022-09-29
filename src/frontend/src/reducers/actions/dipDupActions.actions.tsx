import { AppDispatch, GetState } from 'app/App.controller'
import { normalizeDipDupTokens } from 'app/App.helpers'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { DIPDUP_TOKENS_QUERY, DIPDUP_TOKENS_QUERY_NAME, DIPDUP_TOKENS_QUERY_VARIABLE } from 'gql/queries/getTokensData'

export const GET_DIP_DUP_TOKENS = 'GET_DIP_DUP_TOKENS'
export const getDipDupTokensStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(DIPDUP_TOKENS_QUERY, DIPDUP_TOKENS_QUERY_NAME, DIPDUP_TOKENS_QUERY_VARIABLE)
    const dipDupTokens = normalizeDipDupTokens(storage)

    dispatch({
      type: GET_DIP_DUP_TOKENS,
      dipDupTokens,
    })
  } catch (e) {
    console.error('getDipDupTokensStorage error: ', e)
  }
}
