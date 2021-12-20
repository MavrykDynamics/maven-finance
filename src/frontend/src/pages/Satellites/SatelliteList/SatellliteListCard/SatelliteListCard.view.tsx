import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { SatelliteRecord } from 'reducers/delegation'

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
} from './SatelliteListCard.style'

type SatelliteListCardViewProps = {
  satellite: SatelliteRecord
  loading: boolean
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: (satelliteAddress: string) => void
}
export const SatelliteListCard = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
}: SatelliteListCardViewProps) => {
  return (
    <SatelliteCard key={String(`satellite${satellite.address}`)}>
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
          <SatelliteMainText>{satellite.totalDelegatedAmount}</SatelliteMainText>
          <SatelliteSubText>Delegated MVK</SatelliteSubText>
        </SatelliteTextGroup>
        <SatelliteTextGroup>
          <SatelliteMainText>{satellite.totalDelegatedAmount}</SatelliteMainText>
          <SatelliteSubText>Your delegated MVK</SatelliteSubText>
        </SatelliteTextGroup>
        <Button
          text="Delegate"
          icon="man-check"
          loading={loading}
          onClick={() => delegateCallback(satellite.address)}
        />
        <Link to={{ pathname: `/satellite-details/${satellite.address}` }}>
          <Button text="Profile Details" icon="man" kind="transparent" />
        </Link>
        <SatelliteTextGroup>
          <SatelliteMainText>{satellite.totalDelegatedAmount}%</SatelliteMainText>
          <SatelliteSubText>Participation</SatelliteSubText>
        </SatelliteTextGroup>
        <SatelliteTextGroup>
          <SatelliteMainText>{satellite.satelliteFee}%</SatelliteMainText>
          <SatelliteSubText>Fee</SatelliteSubText>
        </SatelliteTextGroup>
        <Button
          text="Undelegate"
          icon="man-close"
          kind="secondary"
          loading={loading}
          onClick={() => undelegateCallback(satellite.address)}
        />
      </SatelliteCardTopRow>
      <ColoredLine kind="secondary" />
      <SatelliteCardRow>Currently supporting Proposal 42 - Adjusting Auction Parameters</SatelliteCardRow>
    </SatelliteCard>
  )
}
