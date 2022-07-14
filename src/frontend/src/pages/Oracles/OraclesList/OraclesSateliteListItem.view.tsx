import * as React from 'react'
import { useSelector } from 'react-redux'
/* @ts-ignore */
import Time from 'react-pure-time'

// types
import { State } from 'reducers'
import { OracleSatelliteListItemProps } from '../Oracles.types'

// consts, helpers, actions
import { DOWN } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { RoutingButton } from 'app/App.components/RoutingButton/RoutingButton.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
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
} from 'pages/Satellites/SatelliteList/SatellliteListCard/SatelliteListCard.style'
import { OracleStatusComponent } from './OraclesList.styles'

export const OracleSatelliteListItem = ({
  satelliteOracle,
  loading,
  delegateCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  className = '',
}: OracleSatelliteListItemProps) => {
  const totalDelegatedMVK = satelliteOracle.totalDelegatedAmount
  const sMvkBalance = satelliteOracle.sMvkBalance

  return (
    <SatelliteCard className={className} key={String(`satellite${satelliteOracle.address}`)}>
      <SatelliteCardInner>
        <SatelliteCardTopRow>
          <SideBySideImageAndText>
            <SatelliteProfileImageContainer>
              <AvatarStyle>
                <SatelliteProfileImage src={satelliteOracle.image} />
              </AvatarStyle>
            </SatelliteProfileImageContainer>

            <SatelliteTextGroup>
              <SatelliteMainText>{satelliteOracle.name}</SatelliteMainText>
              <TzAddress tzAddress={satelliteOracle.address} type={'secondary'} hasIcon={true} isBold={true} />
            </SatelliteTextGroup>
          </SideBySideImageAndText>

          <SatelliteTextGroup oracle>
            <SatelliteMainText oracle>Delegated MVK</SatelliteMainText>
            <SatelliteSubText oracle>
              <CommaNumber value={totalDelegatedMVK} />
            </SatelliteSubText>
          </SatelliteTextGroup>

          <SatelliteTextGroup oracle>
            <SatelliteMainText oracle>Free sMVK Space</SatelliteMainText>
            <SatelliteSubText oracle>
              <CommaNumber value={sMvkBalance - totalDelegatedMVK} />
            </SatelliteSubText>
          </SatelliteTextGroup>

          <SatelliteProfileDetails>
            <RoutingButton
              icon="man"
              text="Profile Details"
              kind="transparent"
              pathName={`/satellite-details/${satelliteOracle.address}`}
            />
          </SatelliteProfileDetails>

          <SatelliteTextGroup oracle>
            <SatelliteMainText oracle>Participation</SatelliteMainText>
            <SatelliteSubText oracle>
              <CommaNumber value={Number(satelliteOracle.participation || 0)} endingText="%" />
            </SatelliteSubText>
          </SatelliteTextGroup>

          <SatelliteTextGroup oracle>
            {/* <SatelliteMainText oracle>Oracle Status</SatelliteMainText> */}
            <SatelliteSubText oracle>
              <OracleStatusComponent statusType="responded">responded</OracleStatusComponent>
            </SatelliteSubText>
          </SatelliteTextGroup>
        </SatelliteCardTopRow>

        <SatelliteCardButtons>
          {satelliteOracle.active ? (
            <Button
              text="Delegate"
              icon="man-check"
              kind={ACTION_PRIMARY}
              loading={loading}
              onClick={() => delegateCallback(satelliteOracle.address)}
            />
          ) : (
            <div>
              <StatusFlag status={DOWN} text={'INACTIVE'} />
            </div>
          )}
        </SatelliteCardButtons>
      </SatelliteCardInner>

      {/* TODO: add last voted??? */}
      {true ? <SatelliteCardRow>some news</SatelliteCardRow> : null}
    </SatelliteCard>
  )
}
