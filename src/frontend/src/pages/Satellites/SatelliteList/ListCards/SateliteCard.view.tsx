import * as React from 'react'
import { useSelector } from 'react-redux'

// types
import { State } from 'reducers'
import { SatelliteListItemProps } from '../../helpers/Satellites.types'

// consts, helpers, actions
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

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

export const SatelliteListItem = ({
  satellite,
  loading,
  delegateCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  isExtendedListItem = false,
  className = '',
  children,
}: SatelliteListItemProps) => {
  const totalDelegatedMVK = satellite.totalDelegatedAmount
  const sMvkBalance = satellite.sMvkBalance

  const {
    governanceStorage: { proposalLedger },
  } = useSelector((state: State) => state.governance)
  const myDelegatedMVK = userStakedBalance
  const userIsDelegatedToThisSatellite = satellite.address === satelliteUserIsDelegatedTo

  const currentlySupportingProposalId = satellite.proposalVotingHistory?.length
    ? satellite.proposalVotingHistory[0].proposalId
    : null

  const currentlySupportingProposal = proposalLedger?.length
    ? proposalLedger.find((proposal: any) => proposal.id === currentlySupportingProposalId)
    : null

  return (
    <SatelliteCard className={className} key={String(`satellite${satellite.address}`)}>
      <SatelliteCardInner>
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

          <SatelliteTextGroup oracle>
            <SatelliteMainText oracle>Delegated MVK</SatelliteMainText>
            <SatelliteSubText oracle>
              <CommaNumber value={totalDelegatedMVK} />
            </SatelliteSubText>
          </SatelliteTextGroup>

          {isExtendedListItem ? (
            <SatelliteTextGroup oracle>
              <SatelliteMainText oracle>Your delegated MVK</SatelliteMainText>
              <SatelliteSubText oracle>
                {userIsDelegatedToThisSatellite ? <CommaNumber value={myDelegatedMVK} /> : <div>0</div>}
              </SatelliteSubText>
            </SatelliteTextGroup>
          ) : (
            <SatelliteTextGroup oracle>
              <SatelliteMainText oracle>Free sMVK Space</SatelliteMainText>
              <SatelliteSubText oracle>
                <CommaNumber value={sMvkBalance - totalDelegatedMVK} />
              </SatelliteSubText>
            </SatelliteTextGroup>
          )}

          {isExtendedListItem ? (
            <SatelliteTextGroup oracle>
              <SatelliteMainText oracle>Signed feeds</SatelliteMainText>
              <SatelliteSubText oracle>
                <CommaNumber value={Number(satellite.feeds?.length || 0)} />
              </SatelliteSubText>
            </SatelliteTextGroup>
          ) : null}

          <SatelliteProfileDetails>
            <RoutingButton
              icon="man"
              text="Profile Details"
              kind="transparent"
              pathName={`/satellite-details/${satellite.address}/oracle`}
            />
          </SatelliteProfileDetails>

          <SatelliteTextGroup oracle>
            <SatelliteMainText oracle>Participation</SatelliteMainText>
            <SatelliteSubText oracle>
              <CommaNumber value={Number(satellite.participation || 0)} endingText="%" />
            </SatelliteSubText>
          </SatelliteTextGroup>

          {isExtendedListItem ? (
            <SatelliteTextGroup oracle>
              <SatelliteMainText oracle>Fee</SatelliteMainText>
              <SatelliteSubText oracle>
                <CommaNumber value={Number(satellite.satelliteFee / 100)} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>
          ) : null}

          <SatelliteTextGroup oracle>
            {/* <SatelliteMainText oracle>Oracle Status</SatelliteMainText> */}
            <SatelliteSubText oracle>
              <SatelliteOracleStatusComponent statusType="responded">responded</SatelliteOracleStatusComponent>
            </SatelliteSubText>
          </SatelliteTextGroup>
        </SatelliteCardTopRow>

        <SatelliteCardButtons>
          {/* {satellite.active ? ( */}
          <Button
            text="Delegate"
            icon="man-check"
            kind={ACTION_PRIMARY}
            loading={loading}
            onClick={() => delegateCallback(satellite.address)}
          />
          {/* ) : (
            <div>
              <StatusFlag status={DOWN} text={'INACTIVE'} />
            </div>
          )} */}
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
