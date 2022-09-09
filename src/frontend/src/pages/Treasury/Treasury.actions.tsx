import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import {
  GET_TREASURY_DATA,
  TREASURY_SMVK_QUERY,
  TREASURY_SMVK_QUERY_NAME,
  TREASURY_SMVK_QUERY_VARIABLES,
  TREASURY_STORAGE_QUERY_NAME,
  TREASURY_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getTreasuryStorage'
import { getTreasuryDataByAddress } from 'utils/api'
import { TreasuryBalanceType, TreasuryGQLType } from 'utils/TypesAndInterfaces/Treasury'

import { State } from '../../reducers'
import { TezosToolkit } from '@taquito/taquito'
import { TREASURY_ASSSET_BALANCE_DIVIDER, TREASURY_BALANCE_DIVIDER } from './treasury.const'
import CoinGecko from 'coingecko-api'
import { normalizeTreasury } from './Treasury.helpers'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'

const coinGeckoClient = new CoinGecko()

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
    const parsedsMVKAmount = sMVKAmounts.mavryk_user?.map(
      ({ smvk_balance, address }: { smvk_balance: number; address: string }) => {
        // TODO: clarify some fieds for sMVK (Example of token object)
        // balance: 5299.975
        // contract: "KT1FzmWjf3Wi5MsxvjwZa1CkwekSzhhAPJpj"
        // decimals: 9
        // is_transferable: true
        // name: "MAVRYK"
        // network: "ghostnet"
        // symbol: "MVK"
        // thumbnail_uri: "https://mavryk.finance/logo192.png"
        // token_id: 0

        return {
          balance: smvk_balance,
          treasuryAddress: address,
          name: 'Staked MAVRYK',
          symbol: 'sMVK',
          token_id: 0,
          rate: MVK_EXCHANGE_RATE,
        }
      },
    )

    // Map addresses to api cals with treasury addresses
    const getTreasuryCallbacks = convertedStorage.treasuryAddresses.map(
      ({ address }: { address: string }) =>
        () =>
          getTreasuryDataByAddress(address),
    )

    // Await promises from upper
    const fetchedTheasuryData = await Promise.all(getTreasuryCallbacks.map((fn) => fn()))

    // Mapping assets for every treasury, to fetch rates for them
    const arrayOfAssetsSymbols: Set<string> = fetchedTheasuryData.reduce((acc, treasuryData) => {
      treasuryData.balances.forEach((asset: TreasuryBalanceType) => acc.add(asset.symbol))
      return acc
    }, new Set<string>())

    // Fetching rates for every asset in treasury
    const treasuryAssetsPrices = (
      await coinGeckoClient.simple.price({
        ids: Array.from(arrayOfAssetsSymbols),
        vs_currencies: ['usd'],
      })
    ).data

    // Map every treasury to combine treasury name, and divide balance by constant
    const treasuryStorage = convertedStorage.treasuryAddresses.map((treasuryData: TreasuryGQLType, idx: number) => {
      const tresuryTokensWithValidBalances = fetchedTheasuryData[idx].balances
        .map((token: TreasuryBalanceType) => ({
          ...token,
          balance: Number(token.balance) / TREASURY_BALANCE_DIVIDER,
          rate: token.symbol === 'MVK' ? MVK_EXCHANGE_RATE : treasuryAssetsPrices[token.symbol],
        }))
        .concat(
          parsedsMVKAmount.find(
            ({ treasuryAddress }: { treasuryAddress: string }) => treasuryAddress === treasuryData.address,
          ) || [],
        )
        .sort(
          (asset1: TreasuryBalanceType, asset2: TreasuryBalanceType) =>
            asset2.balance * TREASURY_ASSSET_BALANCE_DIVIDER - asset1.balance * TREASURY_ASSSET_BALANCE_DIVIDER,
        )

      return {
        ...treasuryData,
        name:
          treasuryData.name ||
          `Treasury ${treasuryData.address.slice(0, 7)}...${treasuryData.address.slice(
            treasuryData.address.length - 4,
            treasuryData.address.length,
          )}`,
        balances: tresuryTokensWithValidBalances,
      }
    })

    dispatch({
      type: SET_TREASURY_STORAGE,
      treasuryStorage,
      treasuryFactoryAddress: convertedStorage.treasuryFactoryAddress,
    })
  } catch (error) {
    dispatch(showToaster(ERROR, 'Small problem :)', 'Error while loading treasuries occured, please try later'))

    console.log('%c ---- error getTreasuryStorage', 'color:red', error)
  }
}

export const GET_VESTING_STORAGE = 'GET_VESTING_STORAGE'
export const getVestingStorage = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const state: State = getState()

    const contract = accountPkh
      ? await state?.wallet?.tezos?.wallet?.at(state?.contractAddresses?.vestingAddress?.address)
      : await new TezosToolkit(process.env.REACT_APP_RPC_PROVIDER || 'https://hangzhounet.api.tez.ie/')?.contract?.at(
          state?.contractAddresses?.vestingAddress?.address,
        )

    const storage = await contract?.storage()
    console.log('Printing out Vesting storage:\n', storage)

    dispatch({
      type: GET_VESTING_STORAGE,
      vestingStorage: storage,
    })
  } catch (error) {
    console.log('%c ----- error getVestingStorage', 'color:red', error)
  }
}
