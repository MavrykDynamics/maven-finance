//styles
import { AvatarStyle } from 'app/App.components/Avatar/Avatar.style'
// consts, helpers, actions
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { RoutingButton } from 'app/App.components/RoutingButton/RoutingButton.controller'
import { DOWN } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import * as React from 'react'
import { useSelector } from 'react-redux'
// types
import { State } from 'reducers'

import { SatelliteListItemProps } from '../../helpers/Satellites.types'
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

export const SatelliteListItem = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  isDetailsPage = false,
  className = '',
  children,
}: SatelliteListItemProps) => {
  const totalDelegatedMVK = satellite.totalDelegatedAmount
  const sMvkBalance = satellite.sMvkBalance

  const {
    governanceStorage: { proposalLedger },
  } = useSelector((state: State) => state.governance)
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const { isSatellite } = useSelector((state: State) => state.user.user)
  const myDelegatedMVK = userStakedBalance
  const userIsDelegatedToThisSatellite = satellite.address === satelliteUserIsDelegatedTo
  const isSatelliteOracle = satellite.oracleRecords.length

  const currentlySupportingProposalId = satellite.proposalVotingHistory?.length
    ? satellite.proposalVotingHistory[0].proposalId
    : null

  const currentlySupportingProposal = proposalLedger?.length
    ? proposalLedger.find((proposal) => proposal.id === currentlySupportingProposalId)
    : null

  const signedFeedsCount = React.useMemo(
    () => feeds.filter((feed) => feed.admin === satellite.address).length,
    [feeds, satellite.address],
  )

  const oracleStatusType = getOracleStatus(satellite, feeds)

  const showButtons = !isSatellite && satellite.status === 0
  const buttonToShow = userIsDelegatedToThisSatellite ? (
    <Button
      text="Undelegate"
      icon="man-close"
      kind={ACTION_SECONDARY}
      loading={loading}
      onClick={() => undelegateCallback()}
    />
  ) : (
    <Button
      text="Delegate"
      icon="man-check"
      kind={ACTION_PRIMARY}
      loading={loading}
      onClick={() => delegateCallback(satellite.address)}
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

            {isDetailsPage && !isSatelliteOracle ? (
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
                <CommaNumber value={sMvkBalance - totalDelegatedMVK} />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {isDetailsPage && isSatelliteOracle ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Signed feeds</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={signedFeedsCount} />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}
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
                <CommaNumber value={Number(satellite.participation || 0)} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {(isDetailsPage && isSatelliteOracle) || !isSatelliteOracle ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Fee</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={satellite.satelliteFee} endingText="%" />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}

            {isDetailsPage && !isSatelliteOracle ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Count of delegators</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={satellite.delegatorCount} />
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
          {showButtons ? (
            buttonToShow
          ) : (
            <div>
              <StatusFlag status={DOWN} text={'INACTIVE'} />
            </div>
          )}
        </SatelliteCardButtons>
      </SatelliteCardInner>

      {children ? (
        children
      ) : currentlySupportingProposal ? (
        <SatelliteCardRow>
          Currently supporting Proposal {currentlySupportingProposal.id} - {currentlySupportingProposal.title}
        </SatelliteCardRow>
      ) : (
        <SatelliteCardRow>Considering</SatelliteCardRow>
      )}
    </SatelliteCard>
  )
}
