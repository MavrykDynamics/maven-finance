import { getVMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { registerAsSatellite, RegisterAsSatelliteForm } from './BecomeSatellite.actions'
import { BecomeSatelliteView } from './BecomeSatellite.view'

export const BecomeSatellite = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getVMvkTokenStorage(accountPkh))
    }
  }, [dispatch, accountPkh])

  // useOnBlock(tezos, loadStorage)

  const registerCallback = (form: RegisterAsSatelliteForm) => {
    dispatch(registerAsSatellite(form))
  }

  return (
    <BecomeSatelliteView
      registerCallback={registerCallback}
      accountPkh={accountPkh}
      myVMvkTokenBalance={myVMvkTokenBalance}
    />
  )
}
