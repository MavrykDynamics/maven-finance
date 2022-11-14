import { AppDispatch, GetState } from 'app/App.controller'
import { normalizeDipDupTokens } from 'app/App.helpers'
import CoinGecko from 'coingecko-api'
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

const coinGeckoClient = new CoinGecko()
export const GET_TOKENS_PRICES = 'GET_TOKENS_PRICES'
export const getTokensPrices = () => async (dispatch: any) => {
  try {
    const tokensInfoFromCoingecko = await coinGeckoClient.simple.price({
      ids: ['bitcoin', 'tezos', 'tzbtc'],
      vs_currencies: ['usd', 'eur'],
    })

    dispatch({
      type: GET_TOKENS_PRICES,
      tokensPrices: tokensInfoFromCoingecko.data,
    })
  } catch (e) {
    console.error('getTokensPrices error: ', e)
  }
}
