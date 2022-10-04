import * as React from 'react'
import { useEffect, useMemo } from 'react'
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
  const {
    governanceStorage: { financialRequestLedger, proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const { mySatelliteRewardsData, mySMvkTokenBalance = 0 } = useSelector((state: State) => state.user)
  const {
    emergencyGovernanceStorage: { emergencyGovernanceLedger },
  } = useSelector((state: State) => state.emergencyGovernance)
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

  const satelliteMetrics = useMemo(() => {
    const submittedProposalsCount = pastProposals
      .concat(proposalLedger)
      .reduce((acc, { locked, executed }) => (acc += locked && executed ? 1 : 0), 0)
    const totalVotingPeriods =
      emergencyGovernanceLedger.length +
      (financialRequestLedger?.length ?? 0) +
      proposalLedger.length +
      pastProposals.length

    const votedProposalSubmitted =
      currentSatellite.proposalVotingHistory?.reduce((acc, { submitted }) => (submitted ? (acc += 1) : acc), 0) ?? 0
    const satelliteVotes =
      (currentSatellite.emergencyGovernanceVotes?.length ?? 0) +
      (currentSatellite.satelliteActionVotes?.length ?? 0) +
      (currentSatellite.proposalVotingHistory?.length ?? 0) +
      (currentSatellite.financialRequestsVotes?.length ?? 0)

    return {
      proposalParticipation: (votedProposalSubmitted * 100) / submittedProposalsCount,
      votingPartisipation: (satelliteVotes * 100) / totalVotingPeriods,
      oracleEfficiency: 0,
    }
  }, [currentSatellite])

  return (
    <SatelliteDetailsView
      satellite={currentSatellite}
      userSatelliteReward={mySatelliteRewardsData}
      loading={loading}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
      claimRewardsCallback={handleClaimRewards}
      userStakedBalanceInSatellite={mySMvkTokenBalance}
      satelliteMetrics={satelliteMetrics}
    />
  )
}
