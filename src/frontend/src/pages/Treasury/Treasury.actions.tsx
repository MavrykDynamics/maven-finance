import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import storageToTypeConverter from '../../utils/storageToTypeConverter'
import {
  GET_TREASURY_DATA,
  TREASURY_SMVK_QUERY,
  TREASURY_SMVK_QUERY_NAME,
  TREASURY_SMVK_QUERY_VARIABLES,
  TREASURY_STORAGE_QUERY_NAME,
  TREASURY_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getTreasuryStorage'
import { getTreasuryDataByAddress } from 'utils/api'
import { FetchedTreasuryType, TreasuryGQLType } from 'utils/TypesAndInterfaces/Treasury'

import { State } from '../../reducers'
import { TezosToolkit } from '@taquito/taquito'
import { TREASURY_ASSSET_BALANCE_DIVIDER, TREASURY_BALANCE_DIVIDER } from './treasury.const'

export const GET_TREASURY_STORAGE = 'GET_TREASURY_STORAGE'
export const SET_TREASURY_STORAGE = 'SET_TREASURY_STORAGE'

export const fillTreasuryStorage = () => async (dispatch: any) => {
  try {
    // Get treasury addresses from gql
    const treasuryAddressesStorage = await fetchFromIndexer(
      GET_TREASURY_DATA,
      TREASURY_STORAGE_QUERY_NAME,
      TREASURY_STORAGE_QUERY_VARIABLE,
    )

    // Parse gql data to understandable data format
    const convertedStorage = storageToTypeConverter('treasury', treasuryAddressesStorage)

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
        }
      },
    )

    // Map addresses to api cals with treasury addresses
    const getTreasuryCallbacks: Array<() => FetchedTreasuryType> = convertedStorage.treasuryAddresses.map(
      ({ address }: { address: string }) =>
        () =>
          getTreasuryDataByAddress(address),
    )

    // Await promises from upper
    const fetchedTheasuryData = await Promise.all(getTreasuryCallbacks.map((fn) => fn()))

    // Map every treasury to combine treasury name, and divide balance by constant
    const treasuryStorage = convertedStorage.treasuryAddresses.map((treasuryData: TreasuryGQLType, idx: number) => {
      const tresuryTokensWithValidBalances = fetchedTheasuryData[idx].balances
        .map((token) => ({
          ...token,
          balance: Number(token.balance) / TREASURY_BALANCE_DIVIDER,
        }))
        .concat(
          parsedsMVKAmount.find(
            ({ treasuryAddress }: { treasuryAddress: string }) => treasuryAddress === treasuryData.address,
          ) || [],
        )
        .sort(
          (asset1, asset2) =>
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
    console.log('%c ---- error getTreasuryStorage', 'color:red', error)
  }
}

export const GET_VESTING_STORAGE = 'GET_VESTING_STORAGE'
export const getVestingStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  try {
    const state: State = getState()

    const contract = accountPkh
      ? await state?.wallet?.tezos?.wallet?.at(state?.contractAddresses?.vestingAddress?.address)
      : await new TezosToolkit(
          (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
        )?.contract?.at(state?.contractAddresses?.vestingAddress?.address)

    const storage = await (contract as any).storage()
    console.log('Printing out Vesting storage:\n', storage)

    dispatch({
      type: GET_VESTING_STORAGE,
      vestingStorage: storage,
    })
  } catch (error) {
    console.log('%c ----- error getVestingStorage', 'color:red', error)
  }
}
