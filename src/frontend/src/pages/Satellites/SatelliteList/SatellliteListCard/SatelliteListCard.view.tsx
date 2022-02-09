import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
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
  const totalDelegatedMVK = parseFloat(satellite.totalDelegatedAmount)
  const myDelegatedMVK = userStakedBalance
  const userIsDelegatedToThisSatellite = satellite.address === satelliteUserIsDelegatedTo
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
