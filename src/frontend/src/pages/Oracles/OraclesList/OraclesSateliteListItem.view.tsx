import { AvatarStyle } from 'app/App.components/Avatar/Avatar.style'
import { ACTION_SECONDARY, ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { RoutingButton } from 'app/App.components/RoutingButton/RoutingButton.controller'
import { DOWN } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
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
import * as React from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

type SatelliteListCardViewProps = {
  satellite: SatelliteRecord
  loading: boolean
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: () => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
  isDetailsPage?: boolean
  className?: string
  children?: React.ReactNode
}
export const OracleSatelliteListItem = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  isDetailsPage = false,
  children = null,
  className = '',
}: SatelliteListCardViewProps) => {
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const proposalLedger = governanceStorage.proposalLedger
  const totalDelegatedMVK = satellite.totalDelegatedAmount
  const sMvkBalance = satellite.sMvkBalance
  console.log(totalDelegatedMVK, sMvkBalance)
  const myDelegatedMVK = userStakedBalance
  const userIsDelegatedToThisSatellite = satellite.address === satelliteUserIsDelegatedTo
  const lastVotedTimestamp = satellite?.proposalVotingHistory?.[0]?.timestamp || ''

  const currentlySupportingProposalId = satellite.proposalVotingHistory?.length
    ? satellite.proposalVotingHistory[0].proposalId
    : null

  const currentlySupportingProposal = proposalLedger?.length
    ? proposalLedger.find((proposal: any) => proposal.id === currentlySupportingProposalId)
    : null

  const delegationButtons = userIsDelegatedToThisSatellite ? (
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
  )

  return (
    <SatelliteCard className={className} key={String(`satellite${satellite.address}`)}>
      <SatelliteCardInner>
        <SatelliteCardTopRow>
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
            <SatelliteMainText>
              <CommaNumber value={sMvkBalance + totalDelegatedMVK} />
            </SatelliteMainText>
            <SatelliteSubText>Delegated MVK</SatelliteSubText>
          </SatelliteTextGroup>
          <SatelliteTextGroup>
            <SatelliteMainText>
              {userIsDelegatedToThisSatellite ? <CommaNumber value={myDelegatedMVK} /> : <div>0</div>}
            </SatelliteMainText>
            <SatelliteSubText>Oracle</SatelliteSubText>
          </SatelliteTextGroup>

          <SatelliteProfileDetails>
            {isDetailsPage ? (
              <SatelliteTextGroup className="voted">
                <SatelliteMainText>
                  <Time value={lastVotedTimestamp} format="M d\t\h, Y" />
                </SatelliteMainText>
                <SatelliteSubText>Last Voted</SatelliteSubText>
              </SatelliteTextGroup>
            ) : (
              <RoutingButton
                icon="man"
                text="Profile Details"
                kind="transparent"
                pathName={`/satellite-details/${satellite.address}`}
              />
            )}
          </SatelliteProfileDetails>
          <SatelliteTextGroup>
            <SatelliteMainText>
              <CommaNumber value={Number(satellite.participation || 0)} endingText="%" />
            </SatelliteMainText>
            <SatelliteSubText>Participation</SatelliteSubText>
          </SatelliteTextGroup>
          <SatelliteTextGroup>
            <SatelliteMainText>
              <CommaNumber value={Number(satellite.satelliteFee / 100)} endingText="%" />
            </SatelliteMainText>
            <SatelliteSubText>Signed feeds </SatelliteSubText>
          </SatelliteTextGroup>
        </SatelliteCardTopRow>
        <SatelliteCardButtons>{delegationButtons}</SatelliteCardButtons>
      </SatelliteCardInner>
      {children ? (
        children
      ) : currentlySupportingProposal ? (
        <SatelliteCardRow>
          Currently supporting Proposal {currentlySupportingProposal.id} - {currentlySupportingProposal.title}
        </SatelliteCardRow>
      ) : null}
    </SatelliteCard>
  )
}
