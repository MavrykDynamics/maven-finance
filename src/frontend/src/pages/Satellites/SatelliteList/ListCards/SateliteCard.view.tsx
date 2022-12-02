import * as React from 'react'
import { useSelector } from 'react-redux'

// consts, helpers, actions
import { DOWN, WARNING } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { RoutingButton } from 'app/App.components/RoutingButton/RoutingButton.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

// types
import { State } from 'reducers'
import { SatelliteStatus } from 'utils/TypesAndInterfaces/Delegation'
import { SatelliteListItemProps } from '../../helpers/Satellites.types'

//styles
import { AvatarStyle } from 'app/App.components/Avatar/Avatar.style'
import {
  SatelliteCard,
  SatelliteCardButtons,
  SatelliteCardInner,
  SatelliteCardRow,
  SatelliteCardTopRow,
  SatelliteMainText,
  SatelliteOracleStatusComponent,
  SatelliteProfileDetails,
  SatelliteProfileImage,
  SatelliteProfileImageContainer,
  SatelliteSubText,
  SatelliteTextGroup,
  SideBySideImageAndText,
} from './SatelliteCard.style'
import { getSatelliteMetrics } from 'pages/Satellites/Satellites.helpers'

const renderVotingHistoryItem = (vote: number) => {
  switch (vote) {
    case 1:
      return <span className="voting-yes">"YES"</span>
    case 2:
      return <span className="voting-pass">"PASS"</span>
    default:
      return <span className="voting-no">"NO"</span>
  }
}

export const SatelliteListItem = ({
  satellite,
  delegateCallback,
  undelegateCallback,
  claimRewardsCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  isDetailsPage = false,
  userHasSatelliteRewards = false,
  className = '',
  children,
}: SatelliteListItemProps) => {
  const totalDelegatedMVK = satellite.totalDelegatedAmount
  const sMvkBalance = satellite.sMvkBalance
  const freesMVKSpace = Math.max(sMvkBalance * satellite.delegationRatio - totalDelegatedMVK, 0)

  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    governanceStorage: { financialRequestLedger, proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const {
    emergencyGovernanceStorage: { emergencyGovernanceLedger },
  } = useSelector((state: State) => state.emergencyGovernance)

  const myDelegatedMVK = userStakedBalance
  const userIsDelegatedToThisSatellite = satellite.address === satelliteUserIsDelegatedTo
  const isSatelliteOracle = satellite.oracleRecords.length

  const currentlySupportingProposalVote = satellite.proposalVotingHistory?.length
    ? satellite.proposalVotingHistory[0].vote
    : null

  const currentlySupportingProposalId = satellite.proposalVotingHistory?.length
    ? satellite.proposalVotingHistory[0].proposalId
    : null

  const currentlySupportingProposal = proposalLedger?.length
    ? proposalLedger.find((proposal) => proposal.id === currentlySupportingProposalId)
    : null

  const oracleStatusType = getOracleStatus(satellite, feeds)
  const satelliteStatusColor = satellite.status === SatelliteStatus.BANNED ? DOWN : WARNING
  const isSatelliteInactive = satellite.status !== SatelliteStatus.ACTIVE

  const satelliteMetrics = React.useMemo(
    () =>
      getSatelliteMetrics(
        pastProposals,
        proposalLedger,
        emergencyGovernanceLedger,
        satellite,
        feeds,
        financialRequestLedger,
      ),
    [satellite],
  )

  const participation = (satelliteMetrics.proposalParticipation + satelliteMetrics.votingPartisipation) / 2

  const buttonToShow = satelliteUserIsDelegatedTo ? (
    <>
      <Button
        text="Undelegate"
        icon="man-close"
        kind={ACTION_SECONDARY}
        onClick={() => undelegateCallback(satellite.address)}
        disabled={!accountPkh}
      />
      {isDetailsPage && claimRewardsCallback && userHasSatelliteRewards ? (
        <Button
          text="Claim Rewards"
          icon="rewards"
          kind={ACTION_PRIMARY}
          onClick={() => claimRewardsCallback()}
          disabled={!accountPkh}
          strokeWidth={0.3}
        />
      ) : null}
    </>
  ) : (
    <Button
      text="Delegate"
      icon="man-check"
      kind={ACTION_PRIMARY}
      onClick={() => delegateCallback(satellite.address)}
      disabled={!accountPkh}
    />
  )

  return (
    <SatelliteCard className={className} key={String(`satellite${satellite.address}`)}>
      <SatelliteCardInner>
        <div className="rows-wrapper">
          <SatelliteCardTopRow isExtendedListItem={isDetailsPage}>
            <SideBySideImageAndText>
              <SatelliteProfileImageContainer>
                <AvatarStyle>
                  <SatelliteProfileImage src={satellite.image} />
                </AvatarStyle>
              </SatelliteProfileImageContainer>

              <SatelliteTextGroup>
                <SatelliteMainText>{satellite.name}</SatelliteMainText>
                <TzAddress tzAddress={satellite.address} type={'secondary'} hasIcon={true} isBold={true} />
              </SatelliteTextGroup>
            </SideBySideImageAndText>

            <SatelliteTextGroup>
              <SatelliteMainText>Delegated MVK</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={totalDelegatedMVK + sMvkBalance} />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {isDetailsPage ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Your delegated MVK</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={userIsDelegatedToThisSatellite ? myDelegatedMVK : 0} />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}

            <SatelliteTextGroup>
              <SatelliteMainText>Free sMVK Space</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={freesMVKSpace} />
              </SatelliteSubText>
            </SatelliteTextGroup>
          </SatelliteCardTopRow>

          <SatelliteCardTopRow isExtendedListItem={isDetailsPage}>
            <SatelliteProfileDetails>
              {!isDetailsPage && (
                <RoutingButton
                  icon="man"
                  text="Profile Details"
                  kind="transparent"
                  pathName={`/satellites/satellite-details/${satellite.address}`}
                />
              )}
            </SatelliteProfileDetails>

            <SatelliteTextGroup>
              <SatelliteMainText>Participation</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={participation} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {isDetailsPage ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Fee</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={satellite.satelliteFee} endingText="%" />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}

            {!isSatelliteOracle ? (
              <SatelliteTextGroup>
                <SatelliteMainText># Delegators</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={satellite.delegatorCount} showDecimal={false} />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}

            {isSatelliteOracle ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Oracle Status</SatelliteMainText>
                <SatelliteSubText>
                  <SatelliteOracleStatusComponent statusType={oracleStatusType}>
                    {ORACLE_STATUSES_MAPPER[oracleStatusType]}
                  </SatelliteOracleStatusComponent>
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}
          </SatelliteCardTopRow>
        </div>

        <SatelliteCardButtons>
          {isSatelliteInactive && (
            <div>
              <StatusFlag status={satelliteStatusColor} text={SatelliteStatus[satellite.status]} />
            </div>
          )}

          {!isSatelliteInactive && !isSatellite && buttonToShow}
        </SatelliteCardButtons>
      </SatelliteCardInner>

      {children
        ? children
        : currentlySupportingProposal?.id &&
          currentlySupportingProposalVote && (
            <SatelliteCardRow>
              <div>
                Voted {renderVotingHistoryItem(currentlySupportingProposalVote)} on current Proposal{' '}
                {currentlySupportingProposal.id} - {currentlySupportingProposal.title}
              </div>
            </SatelliteCardRow>
          )}
    </SatelliteCard>
  )
}
