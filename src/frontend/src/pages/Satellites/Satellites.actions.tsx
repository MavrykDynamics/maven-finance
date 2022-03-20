import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import delegationAddress from 'deployments/delegationAddress.json'
import { getDoormanStorage, getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'
import {
  DelegateRecord,
  DelegationConfig,
  DelegationLedger,
  DelegationStorage,
  SatelliteRecord,
} from 'reducers/delegation'
import { getContractBigmapKeys, getContractStorage } from 'utils/api'
import { PRECISION_NUMBER } from '../../utils/constants'
import { MichelsonMap } from '@taquito/taquito'

export const GET_DELEGATION_STORAGE = 'GET_DELEGATION_STORAGE'
export const getDelegationStorage = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    // const delegationStorageFromIndexer = await fetchFromIndexerWithPromise(
    //   DELEGATION_STORAGE_QUERY,
    //   DELEGATION_STORAGE_QUERY_NAME,
    //   DELEGATION_STORAGE_QUERY_VARIABLE,
    // )
    // const delegationStorage = storageToTypeConverter('delegation', delegationStorageFromIndexer.delegation[0])
    const storage = await getContractStorage(delegationAddress.address)
    const satelliteLedgerBigMap = await getContractBigmapKeys(delegationAddress.address, 'satelliteLedger')
    const delegateLedgerBigMap = await getContractBigmapKeys(delegationAddress.address, 'delegateLedger')

    const satelliteLedger: SatelliteRecord[] = []

    satelliteLedgerBigMap.forEach((element: any) => {
      const satelliteFee =
          Number(element.value?.satelliteFee) > 0
            ? (Number(element.value?.satelliteFee) / PRECISION_NUMBER).toFixed(2)
            : 0,
        mvkBalance =
          Number(element.value?.mvkBalance) > 0 ? (Number(element.value?.mvkBalance) / PRECISION_NUMBER).toFixed(2) : 0,
        totalDelegatedAmount =
          Number(element.value?.totalDelegatedAmount) > 0
            ? (Number(element.value?.totalDelegatedAmount) / PRECISION_NUMBER).toFixed(2)
            : 0

      const newSatellite: SatelliteRecord = {
        address: element.key,
        name: element.value?.name,
        image: element.value?.image,
        description: element.value?.description,
        satelliteFee: String(satelliteFee),
        active: element.value?.status === '1',
        mvkBalance: String(mvkBalance),
        totalDelegatedAmount: String(totalDelegatedAmount),
        registeredDateTime: new Date(element.value?.registeredDateTime),
        unregisteredDateTime: new Date(element.value?.unregisteredDateTime),
      }

      satelliteLedger.push(newSatellite)
    })

    const delegationLedger: DelegationLedger = new MichelsonMap<string, DelegateRecord>()
    delegateLedgerBigMap.forEach((element: any) => {
      const keyAddress = element.key
      const newDelegateRecord: DelegateRecord = {
        satelliteAddress: element.value?.satelliteAddress,
        delegatedDateTime: new Date(element.value?.delegatedDateTime),
      }
      delegationLedger.set(keyAddress, newDelegateRecord)
    })
    const delegationConfig: DelegationConfig = {
      maxSatellites: storage.config.maxSatellites,
      delegationRatio: storage.config.delegationRatio,
      minimumStakedMvkBalance:
        Number(storage.config.minimumStakedMvkBalance) > 0
          ? Number(storage.config.minimumStakedMvkBalance) / PRECISION_NUMBER
          : 0,
    }
    const delegationStorage: DelegationStorage = {
      admin: storage.admin,
      satelliteLedger: satelliteLedger,
      config: delegationConfig,
      delegateLedger: delegationLedger,
      breakGlassConfig: storage.breakGlassConfig,
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
    const contract = await state.wallet.tezos?.wallet.at(delegationAddress.address)
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

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDelegationStorage())
    dispatch(getDoormanStorage())
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
    const contract = await state.wallet.tezos?.wallet.at(delegationAddress.address)
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

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDelegationStorage())
    dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: UNDELEGATE_ERROR,
      error,
    })
  }
}
