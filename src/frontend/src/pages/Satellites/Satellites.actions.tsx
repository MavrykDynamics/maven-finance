import { TezosToolkit } from '@taquito/taquito'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import delegationAddress from 'deployments/delegationAddress'
import doormanAddress from 'deployments/doormanAddress'
import mvkTokenAddress from 'deployments/mvkTokenAddress'
import vMvkTokenAddress from 'deployments/vMvkTokenAddress'
import { State } from 'reducers'
import { DelegationLedger, DelegationStorage, SatelliteRecord } from 'reducers/delegation'
import { getContractBigmapKeys, getContractStorage } from 'utils/api'

export const GET_DELEGATION_STORAGE = 'GET_DELEGATION_STORAGE'
export const getDelegationStorage = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const storage = await getContractStorage(delegationAddress)
    const satelliteLedgerBigMap = await getContractBigmapKeys(delegationAddress, 'satelliteLedger')
    const delegateLedgerBigMap = await getContractBigmapKeys(delegationAddress, 'delegateLedger')

    const satelliteLedger: SatelliteRecord[] = []

    satelliteLedgerBigMap.forEach((element: any) => {
      const newSatellite: SatelliteRecord = {
        address: element.key,
        name: element.value?.name,
        image: element.value?.image,
        description: element.value?.description,
        satelliteFee: Number(element.value?.satelliteFee).toFixed(2),
        status: element.value?.status === '1',
        mvkBalance: Number(element.value?.mvkBalance).toFixed(2),
        totalDelegatedAmount: Number(element.value?.totalDelegatedAmount).toFixed(2),
        registeredDateTime: new Date(element.value?.registeredDateTime),
        unregisteredDateTime: new Date(element.value?.unregisteredDateTime),
      }

      satelliteLedger.push(newSatellite)
    })

    const delegationLedger: DelegationLedger = new Map()
    delegateLedgerBigMap.forEach((element: any) => {
      const keyAddress = element.key,
        valueAddress = element.value?.satelliteAddress
      delegationLedger.set(keyAddress, valueAddress)
    })

    const delegationStorage: DelegationStorage = {
      admin: storage.admin,
      satelliteLedger: satelliteLedger,
      config: storage.config,
      delegateLedger: delegationLedger,
      breakGlassConfig: storage.breakGlassConfig,
      sMvkTokenAddress: storage.sMvkTokenAddress,
      vMvkTokenAddress: storage.vMvkTokenAddress,
      governanceAddress: storage.governanceAddress,
    }

    dispatch({
      type: GET_DELEGATION_STORAGE,
      delegationStorage: delegationStorage,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: GET_DELEGATION_STORAGE,
      error,
    })
  }
}
export const GET_MVK_TOKEN_STORAGE = 'GET_MVK_TOKEN_STORAGE'
export const getMvkTokenStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }

  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(mvkTokenAddress)
    : await new TezosToolkit(process.env.REACT_APP_RPC_PROVIDER as any).contract.at(mvkTokenAddress)

  const storage = await (contract as any).storage()
  const myLedgerEntry = accountPkh ? await storage['ledger'].get(accountPkh) : undefined
  const myBalanceMu = myLedgerEntry?.balance.toNumber()
  const myBalance = myBalanceMu > 0 ? myBalanceMu / 1000000 : 0

  dispatch({
    type: GET_MVK_TOKEN_STORAGE,
    mvkTokenStorage: storage,
    myMvkTokenBalance: myBalance?.toFixed(2),
  })
}

export const GET_V_MVK_TOKEN_STORAGE = 'GET_V_MVK_TOKEN_STORAGE'
export const getVMvkTokenStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }

  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(vMvkTokenAddress)
    : await new TezosToolkit(process.env.REACT_APP_RPC_PROVIDER as any).contract.at(vMvkTokenAddress)

  const storage = await (contract as any).storage()
  const myLedgerEntry = accountPkh ? await storage['ledger'].get(accountPkh) : undefined
  const myBalanceMu = myLedgerEntry?.balance.toNumber()
  const myBalance = myBalanceMu > 0 ? myBalanceMu / 1000000 : 0

  dispatch({
    type: GET_V_MVK_TOKEN_STORAGE,
    vMvkTokenStorage: storage,
    myVMvkTokenBalance: myBalance?.toFixed(2),
  })
}

export const DELEGATE_REQUEST = 'DELEGATE_REQUEST'
export const DELEGATE_RESULT = 'DELEGATE_RESULT'
export const DELEGATE_ERROR = 'DELEGATE_ERROR'
export const delegate = (satelliteAddress: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  console.log('Here in delegate action')
  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(delegationAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.delegateToSatellite(satelliteAddress).send()
    console.log('transaction', transaction)

    dispatch({
      type: DELEGATE_REQUEST,
    })
    dispatch(showToaster(INFO, 'Delegating...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Delegation done', 'All good :)'))

    dispatch({
      type: DELEGATE_RESULT,
    })
    dispatch(getDelegationStorage())
    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getVMvkTokenStorage(state.wallet.accountPkh))
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: DELEGATE_ERROR,
      error,
    })
  }
}

export const UNDELEGATE_REQUEST = 'UNSTAKE_REQUEST'
export const UNDELEGATE_RESULT = 'UNSTAKE_RESULT'
export const UNDELEGATE_ERROR = 'UNSTAKE_ERROR'
export const undelegate = (satelliteAddress: string) => async (dispatch: any, getState: any) => {
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
    const contract = await state.wallet.tezos?.wallet.at(delegationAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods.undelegateFromSatellite(satelliteAddress).send()
    console.log('transaction', transaction)

    dispatch({
      type: UNDELEGATE_REQUEST,
    })
    dispatch(showToaster(INFO, 'Undelegating...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Undelegating done', 'All good :)'))

    dispatch({
      type: UNDELEGATE_RESULT,
    })
    dispatch(getDelegationStorage())
    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getVMvkTokenStorage(state.wallet.accountPkh))
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: UNDELEGATE_ERROR,
      error,
    })
  }
}
