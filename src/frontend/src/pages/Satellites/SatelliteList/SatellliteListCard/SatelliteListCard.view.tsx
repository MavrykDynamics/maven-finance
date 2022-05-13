import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import * as React from 'react'
import {
  SatelliteCard,
  SatelliteCardRow,
  SatelliteCardTopRow,
  SatelliteMainText,
  SatelliteProfileImage,
  SatelliteProfileImageContainer,
  SatelliteSubText,
  SatelliteTextGroup,
  SideBySideImageAndText,
  SatelliteCardInner,
  SatelliteCardButtons,
  SatelliteProfileDetails,
} from './SatelliteListCard.style'
import { RoutingButton } from '../../../../app/App.components/RoutingButton/RoutingButton.controller'
import { SatelliteRecord } from '../../../../utils/TypesAndInterfaces/Delegation'
import { StatusFlag } from '../../../../app/App.components/StatusFlag/StatusFlag.controller'
import { DOWN } from '../../../../app/App.components/StatusFlag/StatusFlag.constants'
import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../../app/App.components/Button/Button.constants'

type SatelliteListCardViewProps = {
  satellite: SatelliteRecord
  loading: boolean
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: (satelliteAddress: string) => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
}
export const SatelliteListCard = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
}: SatelliteListCardViewProps) => {
  const totalDelegatedMVK = satellite.totalDelegatedAmount
  const myDelegatedMVK = userStakedBalance
  const userIsDelegatedToThisSatellite = satellite.address === satelliteUserIsDelegatedTo

  const delegationButtons = userIsDelegatedToThisSatellite ? (
    <>
      {satellite.active ? (
        <Button
          text="Undelegate"
          icon="man-close"
          kind={ACTION_SECONDARY}
          loading={loading}
          onClick={() => undelegateCallback(satellite.address)}
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
  )

  return (
    <SatelliteCard key={String(`satellite${satellite.address}`)}>
      <SatelliteCardInner>
        <SatelliteCardTopRow>
          <SideBySideImageAndText>
            <SatelliteProfileImageContainer>
              <SatelliteProfileImage src={satellite.image} />
            </SatelliteProfileImageContainer>
            <SatelliteTextGroup>
              <SatelliteMainText>{satellite.name}</SatelliteMainText>
              <TzAddress tzAddress={satellite.address} type={'secondary'} hasIcon={true} isBold={true} />
            </SatelliteTextGroup>
          </SideBySideImageAndText>
          <SatelliteTextGroup>
            <SatelliteMainText>
              <CommaNumber value={totalDelegatedMVK} />
            </SatelliteMainText>
            <SatelliteSubText>Delegated MVK</SatelliteSubText>
          </SatelliteTextGroup>
          <SatelliteTextGroup>
            <SatelliteMainText>
              {userIsDelegatedToThisSatellite ? <CommaNumber value={myDelegatedMVK} /> : <div>0</div>}
            </SatelliteMainText>
            <SatelliteSubText>Your delegated MVK</SatelliteSubText>
          </SatelliteTextGroup>

          <SatelliteProfileDetails>
            <RoutingButton
              icon="man"
              text="Profile Details"
              kind="transparent"
              pathName={`/satellite-details/${satellite.address}`}
            />
          </SatelliteProfileDetails>
          <SatelliteTextGroup>
            <SatelliteMainText>
              <CommaNumber value={Number(satellite.totalDelegatedAmount)} endingText="%" />
            </SatelliteMainText>
            <SatelliteSubText>Participation</SatelliteSubText>
          </SatelliteTextGroup>
          <SatelliteTextGroup>
            <SatelliteMainText>
              <CommaNumber value={Number(satellite.satelliteFee)} endingText="%" />
            </SatelliteMainText>
            <SatelliteSubText>Fee</SatelliteSubText>
          </SatelliteTextGroup>
        </SatelliteCardTopRow>
        <SatelliteCardButtons>{delegationButtons}</SatelliteCardButtons>
      </SatelliteCardInner>
      <SatelliteCardRow>Currently supporting Proposal 42 - Adjusting Auction Parameters</SatelliteCardRow>
    </SatelliteCard>
  )
}
