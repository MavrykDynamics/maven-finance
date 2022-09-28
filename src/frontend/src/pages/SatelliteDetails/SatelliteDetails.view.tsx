import * as React from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { State } from 'reducers'
import { Page } from 'styles'
import { Loader } from 'app/App.components/Loader/Loader.view'
import type {
  SatelliteProposalVotingHistory,
  SatelliteFinancialRequestVotingHistory,
} from '../../utils/TypesAndInterfaces/Delegation'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import SatellitePagination from '../Satellites/SatellitePagination/SatellitePagination.view'

// style
import {
  BlockName,
  SatelliteCardBottomRow,
  SatelliteDescrBlock,
  SatelliteMetricsBlock,
  SatelliteVotingHistoryListItem,
  SatelliteVotingInfoWrapper,
} from './SatelliteDetails.style'
import { EmptyContainer } from '../../app/App.style'
import { SatelliteListItem } from 'pages/Satellites/SatelliteList/ListCards/SateliteCard.view'
import { UserSatelliteRewardsData } from 'utils/TypesAndInterfaces/User'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

type SatelliteDetailsViewProps = {
  satellite: SatelliteRecord
  loading: boolean
  delegateCallback: (address: string) => void
  undelegateCallback: () => void
  claimRewardsCallback: () => void
  userStakedBalanceInSatellite: number
  userSatelliteReward: UserSatelliteRewardsData
}

const renderVotingHistoryItem = (item: SatelliteProposalVotingHistory | SatelliteFinancialRequestVotingHistory) => {
  return (
    <SatelliteVotingHistoryListItem key={item.id}>
      <p>{item?.voteName?.split('_').join(' ').toLowerCase()}</p>
      <span className="satellite-voting-history-info">
        Voted{' '}
        {item.vote === 1 ? (
          <b className="voting-yes">YES </b>
        ) : item.vote === 2 ? (
          <b className="voting-abstain">ABSTAIN </b>
        ) : (
          <b className="voting-no">NO </b>
        )}
        <Time value={item.timestamp} format="\o\n M d\t\h, Y" />
      </span>
    </SatelliteVotingHistoryListItem>
  )
}

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No satellite data</figcaption>
  </EmptyContainer>
)

export const SatelliteDetailsView = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
  claimRewardsCallback,
  userStakedBalanceInSatellite: myDelegatedMVK,
  userSatelliteReward,
}: SatelliteDetailsViewProps) => {
  const { satelliteId } = useParams<{ satelliteId: string }>()
  const { user } = useSelector((state: State) => state.user)
  const isSameId = satellite?.address === satelliteId
  const isSatellite = satellite && satellite.address && satellite.address !== 'None'

  return (
    <Page>
      <PageHeader page={'satellites'} />
      <SatellitePagination />
      {loading || !isSameId ? (
        <Loader />
      ) : isSatellite ? (
        <SatelliteListItem
          satellite={satellite}
          delegateCallback={delegateCallback}
          undelegateCallback={undelegateCallback}
          claimRewardsCallback={claimRewardsCallback}
          userStakedBalance={myDelegatedMVK}
          satelliteUserIsDelegatedTo={user.satelliteMvkIsDelegatedTo}
          isDetailsPage={true}
          userHasSatelliteRewards={userSatelliteReward.myAvailableSatelliteRewards > 0}
        >
          <SatelliteCardBottomRow>
            <SatelliteDescrBlock>
              <BlockName>Description:</BlockName>
              <p>{satellite.description}</p>
              {satellite.website ? (
                <a className="satellite-website" href={satellite.website} target="_blank" rel="noreferrer">
                  Website
                </a>
              ) : null}
            </SatelliteDescrBlock>

            <div className="column-wrapper">
              <div>
                <BlockName>Satellite metrics:</BlockName>
                <SatelliteMetricsBlock>
                  <h5>Proposal Participation</h5>
                  <p>
                    <CommaNumber value={0} endingText="%" />
                  </p>
                  <h5>Vote Participation</h5>
                  <p>
                    <CommaNumber value={0} endingText="%" />
                  </p>
                  <h5>Oracle efficiency</h5>
                  <p>
                    <CommaNumber value={0} endingText="%" />
                  </p>
                </SatelliteMetricsBlock>
              </div>

              <SatelliteVotingInfoWrapper>
                <BlockName>Voting History:</BlockName>
                <div className="voting-info-list-wrapper scroll-block">
                  {satellite.proposalVotingHistory?.map((item) => renderVotingHistoryItem(item))}
                  {satellite.financialRequestsVotes?.map((item) => renderVotingHistoryItem(item))}
                  {satellite.emergencyGovernanceVotes?.map((item) => renderVotingHistoryItem(item))}
                  {satellite.satelliteActionVotes?.map((item) => renderVotingHistoryItem(item))}
                  {!satellite.proposalVotingHistory?.length &&
                    !satellite.satelliteActionVotes?.length &&
                    !satellite.financialRequestsVotes?.length &&
                    !satellite.emergencyGovernanceVotes?.length && (
                      <SatelliteVotingHistoryListItem>
                        <p>No voting history available</p>
                      </SatelliteVotingHistoryListItem>
                    )}
                </div>
              </SatelliteVotingInfoWrapper>
            </div>
          </SatelliteCardBottomRow>
        </SatelliteListItem>
      ) : (
        emptyContainer
      )}
    </Page>
  )
}
