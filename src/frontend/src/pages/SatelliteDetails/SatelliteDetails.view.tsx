import * as React from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { State } from 'reducers'
import { Page, PageContent } from 'styles'
import { Loader } from 'app/App.components/Loader/Loader.view'
import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { SatelliteSideBar } from 'pages/Satellites/old_version/SatelliteSideBar_old/SatelliteSideBar.controller'

import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import SatellitePagination from '../Satellites/SatellitePagination/SatellitePagination.view'
// style
import {
  BlockName,
  SatelliteCardBottomRow,
  SatelliteDescrBlock,
  SatelliteDescriptionText,
  SatelliteMetricsBlock,
  SatelliteVotingHistoryListItem,
  SatelliteVotingInfoWrapper,
} from './SatelliteDetails.style'
import { EmptyContainer } from '../../app/App.style'
import { SatelliteListItem } from 'pages/Satellites/SatelliteList/ListCards/SateliteCard.view'

type SatelliteDetailsViewProps = {
  satellite: SatelliteRecord
  loading: boolean
  delegateCallback: (address: string) => void
  undelegateCallback: () => void
  userStakedBalanceInSatellite: number
}

export const SatelliteDetailsView = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
  userStakedBalanceInSatellite,
}: SatelliteDetailsViewProps) => {
  const params: { satelliteId: string } = useParams()
  const { user } = useSelector((state: State) => state.user)
  const { participationMetrics } = useSelector((state: State) => state.delegation)
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const proposalLedger = governanceStorage.proposalLedger
  const totalDelegatedMVK = satellite?.totalDelegatedAmount ?? 0
  const myDelegatedMVK = userStakedBalanceInSatellite

  const options: HTMLReactParserOptions = {
    replace: (domNode: any) => {
      const isElement: boolean = domNode.type && domNode.type === 'tag' && domNode.name
      if (!domNode.attribs || (isElement && domNode.name === 'script')) return
      if (isElement) {
        if (domNode.name === 'strong') {
          return (
            <SatelliteDescriptionText fontWeight={700}>
              {domToReact(domNode.children, options)}
            </SatelliteDescriptionText>
          )
        } else if (domNode.name === 'p') {
          return (
            <SatelliteDescriptionText fontWeight={400}>
              {domToReact(domNode.children, options)}
            </SatelliteDescriptionText>
          )
        } else return
      } else return
    },
  }

  const emptyContainer = (
    <EmptyContainer>
      <img src="/images/not-found.svg" alt=" No proposals to show" />
      <figcaption> No Satellite to show</figcaption>
    </EmptyContainer>
  )

  const isSameId = satellite?.address === params.satelliteId
  const isSatellite = satellite && satellite.address && satellite.address !== 'None'

  const renderVotingHistoryItem = (item: any) => {
    const filteredProposal = proposalLedger?.length
      ? proposalLedger.find((proposal: any) => proposal.id === item.proposalId)
      : null

    return (
      <SatelliteVotingHistoryListItem key={item.id}>
        <p>
          Proposal {item.proposalId} - {filteredProposal?.title}
        </p>
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

  return (
    <Page>
      <PageHeader page={'satellites'} kind={PRIMARY} loading={loading} />
      <SatellitePagination />
      {loading || !isSameId ? (
        <Loader />
      ) : isSatellite ? (
        <SatelliteListItem
          satellite={satellite}
          loading={loading}
          delegateCallback={delegateCallback}
          // undelegateCallback={undelegateCallback}
          userStakedBalance={myDelegatedMVK}
          satelliteUserIsDelegatedTo={user.satelliteMvkIsDelegatedTo}
          isExtendedListItem={true}
        >
          <SatelliteCardBottomRow>
            <SatelliteDescrBlock>
              <BlockName>Description:</BlockName>
              <p>{parse(satellite.description, options)}</p>
              {satellite.website ? (
                <a className="satellite-website" href={satellite.website} target="_blank" rel="noreferrer">
                  Website
                </a>
              ) : null}
            </SatelliteDescrBlock>

            <div className="column-wrapper">
              <div>
                <BlockName>Participation Metrics:</BlockName>
                <SatelliteMetricsBlock>
                  <h5>Poll participation</h5>
                  <p>{participationMetrics.pollParticipation}%</p>
                  <h5>Proposal participation</h5>
                  <p>{participationMetrics.proposalParticipation}%</p>
                  <h5>Communication</h5>
                  <p>{participationMetrics.communication}%</p>
                </SatelliteMetricsBlock>
              </div>

              {satellite.proposalVotingHistory?.length ||
              satellite.financialRequestsVotes?.length ||
              satellite.emergencyGovernanceVotes?.length ? (
                <SatelliteVotingInfoWrapper>
                  <BlockName>Voting History:</BlockName>
                  <div className="voting-info-list-wrapper scroll-block">
                    {satellite.proposalVotingHistory?.map((item) => renderVotingHistoryItem(item))}
                    {satellite.financialRequestsVotes?.map((item) => renderVotingHistoryItem(item))}
                    {satellite.emergencyGovernanceVotes?.map((item) => renderVotingHistoryItem(item))}
                  </div>
                </SatelliteVotingInfoWrapper>
              ) : null}
            </div>
          </SatelliteCardBottomRow>
        </SatelliteListItem>
      ) : (
        emptyContainer
      )}
    </Page>
  )
}
