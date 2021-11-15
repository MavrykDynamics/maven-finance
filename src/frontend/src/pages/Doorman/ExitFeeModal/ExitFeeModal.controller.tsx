import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { hideExitFeeModal } from './ExitFeeModal.actions'
import { ExitFeeModalView } from './ExitFeeModal.view'

export const ExitFeeModal = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { showing } = useSelector((state: State) => state.exitFeeModal)

  // useEffect(() => {
  //   dispatch(getMvkTokenStorage())
  // }, [tezos])

  const hideExitFeeModalCallback = () => {
    dispatch(hideExitFeeModal())
  }

  const unStakeCallback = ({ amount }: { amount: number }) => {
    // if (true) dispatch(stake({ amount }))
    // else dispatch(showToaster(ERROR, 'Exit fee canot be calculated', 'Please wait and try again'))
  }

  return (
    <ExitFeeModalView
      loading={loading}
      showing={showing}
      hideExitFeeModalCallback={hideExitFeeModalCallback}
      unStakeCallback={unStakeCallback}
    />
  )
}
