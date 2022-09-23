import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import {
  DOORMAN_STORAGE_QUERY,
  DOORMAN_STORAGE_QUERY_NAME,
  DOORMAN_STORAGE_QUERY_VARIABLE,
  MVK_TOKEN_STORAGE_QUERY,
  MVK_TOKEN_STORAGE_QUERY_NAME,
  MVK_TOKEN_STORAGE_QUERY_VARIABLE,
  USER_INFO_QUERY,
  USER_INFO_QUERY_NAME,
  USER_INFO_QUERY_VARIABLES,
  USER_REWARDS_QUERY,
  USER_REWARDS_QUERY_NAME,
  USER_REWARDS_QUERY_VARIABLES,
} from '../../gql/queries'
import {
  calcUsersDoormanRewards,
  calcUsersFarmRewards,
  calcUsersSatelliteRewards,
  calcWithoutPrecision,
} from '../../utils/calcFunctions'
import { PRECISION_NUMBER } from '../../utils/constants'
import { setItemInStorage } from '../../utils/storage'
import {
  UserData,
  UserDoormanRewardsData,
  UserFarmRewardsData,
  UserSatelliteRewardsData,
} from '../../utils/TypesAndInterfaces/User'
import { HIDE_EXIT_FEE_MODAL } from './ExitFeeModal/ExitFeeModal.actions'
import { normalizeDoormanStorage, normalizeMvkToken } from './Doorman.converter'
import { FarmContractType } from 'utils/TypesAndInterfaces/Farm'
import { Farm } from 'utils/generated/graphqlTypes'

export const GET_MVK_TOKEN_STORAGE = 'GET_MVK_TOKEN_STORAGE'
export const getMvkTokenStorage = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const storage = await fetchFromIndexer(
    MVK_TOKEN_STORAGE_QUERY,
    MVK_TOKEN_STORAGE_QUERY_NAME,
    MVK_TOKEN_STORAGE_QUERY_VARIABLE,
  )

  const convertedStorage = normalizeMvkToken(storage?.mvk_token[0])

  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: convertedStorage,
    myMvkTokenBalance: 0,
  })
}

export const STAKE_REQUEST = 'STAKE_REQUEST'
export const STAKE_RESULT = 'STAKE_RESULT'
export const STAKE_ERROR = 'STAKE_ERROR'
export const stake = (amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const mvkTokenContract = await state.wallet.tezos?.wallet.at(state.contractAddresses.mvkTokenAddress.address)
    const doormanContract = await state.wallet.tezos?.wallet.at(state.contractAddresses.doormanAddress.address)
    console.log('MvkToken contract', mvkTokenContract)
    console.log('Doorman contract', doormanContract)

    const addOperators = [
        {
          add_operator: {
            owner: state.wallet.accountPkh,
            operator: state.contractAddresses.doormanAddress.address,
            token_id: 0,
          },
        },
      ],
      removeOperators = [
        {
          remove_operator: {
            owner: state.wallet.accountPkh,
            operator: state.contractAddresses.doormanAddress.address,
            token_id: 0,
          },
        },
      ]

    const batch =
      mvkTokenContract &&
      doormanContract &&
      (await state.wallet.tezos?.wallet
        .batch()
        .withContractCall(mvkTokenContract.methods.update_operators(addOperators))
        .withContractCall(doormanContract.methods.stake(amount * PRECISION_NUMBER))
        .withContractCall(mvkTokenContract.methods.update_operators(removeOperators)))
    const batchOp = await batch?.send()

    dispatch({
      type: STAKE_REQUEST,
      amount,
    })
    dispatch(showToaster(INFO, 'Staking...', 'Please wait 30s'))

    const done = await batchOp?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Staking done', 'All good :)'))

    dispatch({
      type: STAKE_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDoormanStorage())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: STAKE_ERROR,
      error,
    })
  }
}

export const UNSTAKE_REQUEST = 'UNSTAKE_REQUEST'
export const UNSTAKE_RESULT = 'UNSTAKE_RESULT'
export const UNSTAKE_ERROR = 'UNSTAKE_ERROR'
export const unstake = (amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.doormanAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.unstake(amount * PRECISION_NUMBER).send()
    console.log('transaction', transaction)

    dispatch({
      type: UNSTAKE_REQUEST,
      amount,
    })
    dispatch(showToaster(INFO, 'Unstaking...', 'Please wait 30s'))
    dispatch({
      type: HIDE_EXIT_FEE_MODAL,
    })

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Unstaking done', 'All good :)'))

    dispatch({
      type: UNSTAKE_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDoormanStorage())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: UNSTAKE_ERROR,
      error,
    })
  }
}

export const COMPOUND_REQUEST = 'COMPOUND_REQUEST'
export const COMPOUND_RESULT = 'COMPOUND_RESULT'
export const COMPOUND_ERROR = 'COMPOUND_ERROR'
export const rewardsCompound = (address: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }
  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.doormanAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.compound(address).send()
    console.log('transaction', transaction)

    dispatch({
      type: COMPOUND_REQUEST,
    })
    dispatch(showToaster(INFO, 'Compounding rewards...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Compounding done', 'All good :)'))

    dispatch({
      type: COMPOUND_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDoormanStorage())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: COMPOUND_ERROR,
      error,
    })
  }

  dispatch(showToaster(INFO, 'Compound', 'Coming Soon', 3000))
}

export const GET_DOORMAN_STORAGE = 'GET_DOORMAN_STORAGE'
export const getDoormanStorage = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    const storage = await fetchFromIndexer(
      DOORMAN_STORAGE_QUERY,
      DOORMAN_STORAGE_QUERY_NAME,
      DOORMAN_STORAGE_QUERY_VARIABLE,
    )

    const convertedStorage = normalizeDoormanStorage(storage?.doorman?.[0])

    dispatch({
      type: GET_DOORMAN_STORAGE,
      storage: convertedStorage,
      totalStakedMvkSupply: convertedStorage.totalStakedMvk,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: GET_DOORMAN_STORAGE,
      error,
    })
  }
}

export const GET_USER_DATA = 'GET_USER_DATA'
export const GET_USER_DATA_ERROR = 'GET_USER_DATA'
export const SET_USER_DATA = 'SET_USER_DATA'
export const UPDATE_USER_DATA = 'UPDATE_USER_DATA'
export const getUserData = (accountPkh: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const currentBlockLevel = state.preferences.headData?.level ?? 0

  try {
    const userInfoFromIndexer = await fetchFromIndexer(
      USER_INFO_QUERY,
      USER_INFO_QUERY_NAME,
      USER_INFO_QUERY_VARIABLES(accountPkh),
    )

    const userRewardsData = await fetchFromIndexer(
      USER_REWARDS_QUERY,
      USER_REWARDS_QUERY_NAME,
      USER_REWARDS_QUERY_VARIABLES(accountPkh),
    )

    const userDoormanRewardsData: UserDoormanRewardsData = {
      generalAccumulatedFeesPerShare: userRewardsData.doorman[0]?.accumulated_fees_per_share ?? 0,
      generalUnclaimedRewards: userRewardsData.doorman[0]?.unclaimed_rewards ?? 0,
      myParticipationFeesPerShare: userRewardsData.doorman[0]?.stake_accounts[0]?.participation_fees_per_share ?? 0,
      myAvailableDoormanRewards: 0,
    }

    const userSatelliteRewardsData: UserSatelliteRewardsData = {
      unpaid: userRewardsData.satellite_rewards[0]?.unpaid ?? 0,
      paid: userRewardsData.satellite_rewards[0]?.paid ?? 0,
      participationRewardsPerShare: userRewardsData.satellite_rewards[0]?.participation_rewards_per_share ?? 0,
      satelliteAccumulatedRewardPerShare:
        userRewardsData.satellite_rewards[0]?.reference?.satellite_accumulated_reward_per_share ?? 0,
      myAvailableSatelliteRewards: 0,
    }

    const userFarmsRewardsData: Record<string, UserFarmRewardsData> = (userRewardsData.farm as Array<Farm>).reduce<
      Record<string, UserFarmRewardsData>
    >((acc, farm) => {
      const farmObj: UserFarmRewardsData = {
        generalAccumulatedRewardsPerShare: farm.accumulated_rewards_per_share,
        currentRewardPerBlock: farm.current_reward_per_block,
        lastBlockUpdate: farm.last_block_update,
        generalTotalRewards: farm.total_rewards,
        generalPaidReward: farm.paid_rewards,
        generalUnpaidReward: farm.unpaid_rewards,
        totalLPTokenDeposited: farm.lp_token_balance,
        infinite: farm.infinite,
        myDepositedAmount: farm.farm_accounts[0].deposited_amount,
        myParticipationRewardsPerShare: farm.farm_accounts[0].participation_rewards_per_share,
        myAvailableFarmRewards: 0,
      }
      acc[farm.address] = farmObj

      return acc
    }, {})

    const userInfoData = userInfoFromIndexer?.mavryk_user[0]

    const userIsDelegatedToSatellite = userInfoData?.delegations.length > 0
    const userInfo: UserData = {
      myAddress: userInfoData?.address,
      myMvkTokenBalance: calcWithoutPrecision(userInfoData?.mvk_balance),
      mySMvkTokenBalance: calcWithoutPrecision(userInfoData?.smvk_balance),
      participationFeesPerShare: calcWithoutPrecision(userInfoData?.participation_fees_per_share),
      satelliteMvkIsDelegatedTo: userIsDelegatedToSatellite ? userInfoData?.delegations[0].satellite?.user_id : '',
      isSatellite: Boolean(
        state.delegation.delegationStorage.satelliteLedger.find(
          ({ address: satelliteAddress }) =>
            satelliteAddress === userInfoData?.address || satelliteAddress === state.wallet?.accountPkh,
        ),
      ),
      myDoormanRewardsData: userDoormanRewardsData,
      myFarmRewardsData: userFarmsRewardsData,
      mySatelliteRewardsData: userSatelliteRewardsData,
    }

    userInfo.myDoormanRewardsData = calcUsersDoormanRewards(userInfo)
    userInfo.mySatelliteRewardsData = calcUsersSatelliteRewards(userInfo)
    userInfo.myFarmRewardsData = calcUsersFarmRewards(userInfo, currentBlockLevel)

    // TODO: ask Sam about it
    // const estimatedRewardsForNextCompound =
    //   userInfo.myDoormanRewardsData.myAvailableDoormanRewards +
    //   userInfo.mySatelliteRewardsData.myAvailableSatelliteRewards

    console.log('%c res getUserData()', 'color:orange', userInfo)

    setItemInStorage('UserData', userInfo)
    dispatch({
      type: GET_USER_DATA,
      userData: userInfo,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: GET_USER_DATA_ERROR,
      error,
    })
  }
}

export const updateUserData = (field: string, value: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    const userState = state.user
    // @ts-ignore
    userState[field] = value
    dispatch({
      type: UPDATE_USER_DATA,
      userKey: field,
      userValue: value,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: UPDATE_USER_DATA,
      error,
    })
  }
}
