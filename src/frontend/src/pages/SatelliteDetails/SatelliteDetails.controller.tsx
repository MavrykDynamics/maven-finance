import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { State } from 'reducers'

import { SatelliteDetailsView } from './SatelliteDetails.view'

import { getSatelliteByAddress } from './SatelliteDetails.actions'
import { delegate, getDelegationStorage, undelegate } from 'pages/Satellites/Satellites.actions'
import { rewardsCompound } from 'pages/Doorman/Doorman.actions'

export const SatelliteDetails = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => Boolean(state.loading))
  const { currentSatellite } = useSelector((state: State) => state.delegation)
  const { mySatelliteRewardsData, mySMvkTokenBalance = 0 } = useSelector((state: State) => state.user)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  let { satelliteId } = useParams<{ satelliteId: string }>()

  useEffect(() => {
    dispatch(getSatelliteByAddress(satelliteId))
    dispatch(getDelegationStorage())
  }, [dispatch, satelliteId])

  const delegateCallback = (address: string) => {
    dispatch(delegate(address))
  }

  const undelegateCallback = () => {
    dispatch(undelegate())
  }

  const handleClaimRewards = () => {
    if (accountPkh) {
      dispatch(rewardsCompound(accountPkh))
    }
  }

  return (
    <SatelliteDetailsView
      satellite={currentSatellite}
      userSatelliteReward={mySatelliteRewardsData}
      loading={loading}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
      claimRewardsCallback={handleClaimRewards}
      userStakedBalanceInSatellite={mySMvkTokenBalance}
    />
  )
}
