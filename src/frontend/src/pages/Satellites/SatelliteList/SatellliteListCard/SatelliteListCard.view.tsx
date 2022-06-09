import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import * as React from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../../app/App.components/Button/Button.constants'
import { RoutingButton } from '../../../../app/App.components/RoutingButton/RoutingButton.controller'
import { DOWN } from '../../../../app/App.components/StatusFlag/StatusFlag.constants'
import { StatusFlag } from '../../../../app/App.components/StatusFlag/StatusFlag.controller'
import { SatelliteRecord } from '../../../../utils/TypesAndInterfaces/Delegation'

import {
  SatelliteCard,
  SatelliteCardButtons,
  SatelliteCardInner,
  SatelliteCardRow,
  SatelliteCardTopRow,
  SatelliteMainText,
  SatelliteProfileDetails,
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
  isDetaisPage?: boolean
  className?: string
  children?: React.ReactNode
}
export const SatelliteListCard = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  isDetaisPage = false,
  children = null,
  className = '',
}: SatelliteListCardViewProps) => {
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const proposalLedger = governanceStorage.proposalLedger
  const totalDelegatedMVK = satellite.totalDelegatedAmount
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
    <SatelliteCard className={className} key={String(`satellite${satellite.address}`)}>
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
            {isDetaisPage ? (
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
              <CommaNumber value={Number(satellite.satelliteFee)} endingText="%" />
            </SatelliteMainText>
            <SatelliteSubText>Fee</SatelliteSubText>
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
