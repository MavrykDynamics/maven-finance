import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { getMvkTokenStorage, getVMvkTokenStorage } from '../Doorman.actions'

import { DoormanStatsView } from './DoormanStats.view'

export const DoormanStats = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { vMvkTokenStorage, myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)

  useEffect(() => {
    dispatch(getMvkTokenStorage())
    dispatch(getVMvkTokenStorage())
  }, [dispatch])

  return (
    <DoormanStatsView
      loading={loading}
      mvkTotalSupply={mvkTokenStorage?.totalSupply}
      vMvkTotalSupply={vMvkTokenStorage?.totalSupply}
    />
  )
}
