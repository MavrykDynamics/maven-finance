import { fetchFromIndexer, fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import {
  GET_TREASURY_DATA,
  TREASURY_SMVK_QUERY,
  TREASURY_SMVK_QUERY_NAME,
  TREASURY_SMVK_QUERY_VARIABLES,
  TREASURY_STORAGE_QUERY_NAME,
  TREASURY_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getTreasuryStorage'
import { getTreasuryAssetsByAddress } from 'utils/api'
import { FetchedTreasuryBalanceType, TreasuryBalanceType, TreasuryGQLType } from 'utils/TypesAndInterfaces/Treasury'

import { normalizeTreasury } from './Treasury.helpers'
import { AppDispatch, coinGeckoClient, GetState } from '../../app/App.controller'
import { normalizeVestingStorage } from 'app/App.helpers'
import { VESTING_STORAGE_QUERY, VESTING_STORAGE_QUERY_NAME, VESTING_STORAGE_QUERY_VARIABLE } from 'gql/queries'

export const GET_TREASURY_STORAGE = 'GET_TREASURY_STORAGE'
export const SET_TREASURY_STORAGE = 'SET_TREASURY_STORAGE'

export const fillTreasuryStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const {
      mvkToken: { exchangeRate: MVK_EXCHANGE_RATE },
    } = getState()
    // Get treasury addresses from gql
    const treasuryAddressesStorage = await fetchFromIndexer(
      GET_TREASURY_DATA,
      TREASURY_STORAGE_QUERY_NAME,
      TREASURY_STORAGE_QUERY_VARIABLE,
    )

    // Parse gql data to understandable data format
    const convertedStorage = normalizeTreasury(treasuryAddressesStorage)

    // Get sMVK balances from gql
    const sMVKAmounts = await fetchFromIndexer(
      TREASURY_SMVK_QUERY,
      TREASURY_SMVK_QUERY_NAME,
      TREASURY_SMVK_QUERY_VARIABLES(
        convertedStorage.treasuryAddresses.map(({ address }: { address: string }) => address),
      ),
    )

    // Parse sMVK amount for each treasury, to make this structure usable
    const parsedsMVKAmount: TreasuryBalanceType[] = sMVKAmounts.mavryk_user?.map(
      ({ smvk_balance, address }: { smvk_balance: number; address: string }): TreasuryBalanceType => {
        return {
          balance: smvk_balance,
          usdValue: smvk_balance * MVK_EXCHANGE_RATE,
          decimals: 9,
          contract: address,
          name: 'Staked MAVRYK',
          symbol: 'sMVK',
          thumbnail_uri: 'https://mavryk.finance/logo192.png',
          rate: MVK_EXCHANGE_RATE,
        }
      },
    )

    // Map addresses to api cals with treasury addresses
    const getTreasuryCallbacks = convertedStorage.treasuryAddresses.map(
      ({ address }: { address: string }) =>
        () =>
          getTreasuryAssetsByAddress(address),
    )

    // Await promises from upper
    const fetchedTheasuryData = await Promise.all(getTreasuryCallbacks.map((fn) => fn()))

    // Mapping assets for every treasury, to fetch rates for them
    const arrayOfAssetsSymbols: Set<string> = fetchedTheasuryData.reduce((acc, treasuryData) => {
      treasuryData.forEach(
        ({
          token: {
            metadata: { symbol },
          },
        }: {
          token: { metadata: { symbol: string } }
        }) => acc.add(symbol),
      )
      return acc
    }, new Set<string>())

    // Fetching rates for every asset in treasury
    const treasuryAssetsFetchedData = (
      await Promise.allSettled(
        Array.from(arrayOfAssetsSymbols).map((symbol) => coinGeckoClient.coins.fetch(symbol, {})),
      )
    ).reduce<Record<string, { rate: number; symbol: string }>>((acc, promiseResult) => {
      const {
        value: { data, success },
      } = promiseResult as any
      if (success) {
        const symbol = data.symbol
        const rate = data.market_data.current_price.usd

        acc[data.id] = { rate, symbol }
      }

      return acc
    }, {})

    // Map every treasury to combine treasury name, and divide balance by constant
    const treasuryStorage = convertedStorage.treasuryAddresses
      .map((treasuryData: TreasuryGQLType, idx: number) => {
        const sMVKAmount = parsedsMVKAmount.find(
          ({ contract }: TreasuryBalanceType) => contract === treasuryData.address,
        )

        const tresuryTokensWithValidBalances = fetchedTheasuryData[idx]
          .map(
            ({
              token: {
                metadata: { symbol, name, decimals, thumbnailUri },
                contract,
              },
              balance,
            }: FetchedTreasuryBalanceType): TreasuryBalanceType => {
              const assetRate = symbol === 'MVK' ? MVK_EXCHANGE_RATE : treasuryAssetsFetchedData[symbol]?.rate
              const coinsAmount = parseFloat(balance) / Math.pow(10, parseInt(decimals))
              const usdValue = coinsAmount * (assetRate ?? 1)

              return {
                contract: contract?.address,
                usdValue: usdValue,
                decimals: parseInt(decimals),
                name: name,
                thumbnail_uri: thumbnailUri,
                symbol: treasuryAssetsFetchedData[symbol]?.symbol ?? symbol,
                balance: coinsAmount,
                rate: assetRate,
              }
            },
          )
          .concat(sMVKAmount || [])
          .filter(({ balance }: TreasuryBalanceType) => balance > 0 || balance.toString().includes('e'))
          .sort(
            (asset1: TreasuryBalanceType, asset2: TreasuryBalanceType) =>
              Number(asset2.balance) * Number(asset2.rate) - Number(asset1.balance) * Number(asset1.rate),
          )

        const treasuryTVL = tresuryTokensWithValidBalances.reduce<number>((acc, { usdValue }) => (acc += usdValue), 0)

        return {
          ...treasuryData,
          name:
            treasuryData.name ||
            `Treasury ${treasuryData.address.slice(0, 7)}...${treasuryData.address.slice(
              treasuryData.address.length - 4,
              treasuryData.address.length,
            )}`,
          balances: tresuryTokensWithValidBalances,
          treasuryTVL,
        }
      })
      .filter(({ balances }) => Boolean(balances.length))

    dispatch({
      type: SET_TREASURY_STORAGE,
      treasuryStorage,
      treasuryFactoryAddress: convertedStorage.treasuryFactoryAddress,
    })
  } catch (error) {
    console.log('%c ---- error getTreasuryStorage', 'color:red', error)
  }
}

export const GET_VESTING_STORAGE = 'GET_VESTING_STORAGE'
export const getVestingStorage = () => async (dispatch: AppDispatch) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      VESTING_STORAGE_QUERY,
      VESTING_STORAGE_QUERY_NAME,
      VESTING_STORAGE_QUERY_VARIABLE,
    )

    const vestingStorage = normalizeVestingStorage(storage)

    dispatch({
      type: GET_VESTING_STORAGE,
      vestingStorage: vestingStorage,
    })
  } catch (error) {
    console.log('%c ----- error getVestingStorage', 'color:red', error)
  }
}
