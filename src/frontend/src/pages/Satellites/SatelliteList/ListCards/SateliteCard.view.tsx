import * as React from 'react'
import { useSelector } from 'react-redux'

// types
import { State } from 'reducers'
import { SatelliteListItemProps } from '../../helpers/Satellites.types'

// consts, helpers, actions
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { RoutingButton } from 'app/App.components/RoutingButton/RoutingButton.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

//styles
import { AvatarStyle } from 'app/App.components/Avatar/Avatar.style'
import {
  SatelliteCard,
  SatelliteCardInner,
  SatelliteCardTopRow,
  SideBySideImageAndText,
  SatelliteProfileImageContainer,
  SatelliteProfileImage,
  SatelliteTextGroup,
  SatelliteMainText,
  SatelliteSubText,
  SatelliteProfileDetails,
  SatelliteCardButtons,
  SatelliteCardRow,
  SatelliteOracleStatusComponent,
} from './SatelliteCard.style'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { DOWN } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'

export const SatelliteListItem = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  isExtendedListItem = false,
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
  const myDelegatedMVK = userStakedBalance
  const userIsDelegatedToThisSatellite = satellite.address === satelliteUserIsDelegatedTo
  const isSatelliteOracle = satellite.oracleRecords.length

  const currentlySupportingProposalId = satellite.proposalVotingHistory?.length
    ? satellite.proposalVotingHistory[0].proposalId
    : null

  const currentlySupportingProposal = proposalLedger?.length
    ? proposalLedger.find((proposal: any) => proposal.id === currentlySupportingProposalId)
    : null

  const oracleStatusType = getOracleStatus(satellite, feeds)

  return (
    <SatelliteCard className={className} key={String(`satellite${satellite.address}`)}>
      <SatelliteCardInner>
        <div className="rows-wrapper">
          <SatelliteCardTopRow isExtendedListItem={isExtendedListItem}>
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
                <CommaNumber value={totalDelegatedMVK} />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {(isExtendedListItem && isSatelliteOracle) || !isSatelliteOracle ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Your delegated MVK</SatelliteMainText>
                <SatelliteSubText>
                  {userIsDelegatedToThisSatellite ? <CommaNumber value={myDelegatedMVK} /> : <div>0</div>}
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : (
              <SatelliteTextGroup>
                <SatelliteMainText>Free sMVK Space</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={sMvkBalance - totalDelegatedMVK} />
                </SatelliteSubText>
              </SatelliteTextGroup>
            )}

            {isExtendedListItem && isSatelliteOracle ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Signed feeds</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={Number(satellite.feeds?.length || 0)} />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}
          </SatelliteCardTopRow>

          <SatelliteCardTopRow isExtendedListItem={isExtendedListItem}>
            <SatelliteProfileDetails>
              {!isDetailsPage && (
                <RoutingButton
                  icon="man"
                  text="Profile Details"
                  kind="transparent"
                  pathName={`/satellite-details/${satellite.address}`}
                />
              )}
            </SatelliteProfileDetails>

            <SatelliteTextGroup>
              <SatelliteMainText>Participation</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={Number(satellite.participation || 0)} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {(isExtendedListItem && isSatelliteOracle) || !isSatelliteOracle ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Fee</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={Number(satellite.satelliteFee / 100)} endingText="%" />
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
          {userIsDelegatedToThisSatellite ? (
            <>
              {satellite.active ? (
                <Button
                  text="Undelegate"
                  icon="man-close"
                  kind={ACTION_SECONDARY}
                  loading={loading}
                  onClick={() => undelegateCallback()}
                />
              ) : null}
            </>
          ) : (
            <>
              {satellite.active ? (
                <Button
                  text="Delegate"
                  icon="man-check"
                  kind={ACTION_PRIMARY}
                  loading={loading}
                  onClick={() => delegateCallback(satellite.address)}
                />
              ) : (
                <div>
                  <StatusFlag status={DOWN} text={'INACTIVE'} />
                </div>
              )}
            </>
          )}
        </SatelliteCardButtons>
      </SatelliteCardInner>

      {children && children}

      {currentlySupportingProposal && !children ? (
        <SatelliteCardRow>
          Currently supporting Proposal {currentlySupportingProposal.id} - {currentlySupportingProposal.title}
        </SatelliteCardRow>
      ) : null}
    </SatelliteCard>
  )
}
