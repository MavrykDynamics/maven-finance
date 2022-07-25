import * as React from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { State } from 'reducers'
import { Page, PageContent } from 'styles'
import { Loader } from 'app/App.components/Loader/Loader.view'
import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { SatelliteListCard } from 'pages/Satellites/SatelliteList/SatellliteListCard/SatelliteListCard.view'
import { SatelliteSideBar } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'

import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import SatellitePagination from '../Satellites/SatellitePagination/SatellitePagination.view'
import { checkIfUserIsSatellite } from '../Satellites/SatelliteSideBar/SatelliteSideBar.controller'

// style
import { SatelliteCardBottomRow, SatelliteDescriptionText } from './SatelliteDetails.style'
import { EmptyContainer } from '../../app/App.style'

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
  const { participationMetrics, delegationStorage } = useSelector((state: State) => state.delegation)
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const userIsSatellite = checkIfUserIsSatellite(accountPkh, delegationStorage?.satelliteLedger)
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

  const renderVotingHistoryItem = (governanceType: string, item: any) => {
    const filteredProposal = proposalLedger?.length
      ? proposalLedger.find((proposal: any) => proposal.id === item.proposalId)
      : null

    return (
      <div className="satellite-voting-history" key={item.id}>
        <p>
          {governanceType} Proposal {item.proposalId} - {filteredProposal?.title}
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
      </div>
    )
  }

  return (
    <Page>
      <PageHeader page={'satellites'} kind={PRIMARY} loading={loading} />
      <PageContent>
        <div>
          <SatellitePagination />
          {loading || !isSameId ? (
            <Loader />
          ) : isSatellite ? (
            <SatelliteListCard
              satellite={satellite}
              loading={loading}
              delegateCallback={delegateCallback}
              undelegateCallback={undelegateCallback}
              userStakedBalance={myDelegatedMVK}
              satelliteUserIsDelegatedTo={user.satelliteMvkIsDelegatedTo}
              isDetailsPage
              userIsSatellite={userIsSatellite}
            >
              <SatelliteCardBottomRow>
                <div className="descr satellite-info-block">
                  <h4>Description:</h4>
                  <p>{parse(satellite.description, options)}</p>
                  {satellite.website ? (
                    <a className="satellite-website" href={satellite.website} target="_blank" rel="noreferrer">
                      Website
                    </a>
                  ) : null}
                </div>

                <div className="satellite-info-block">
                  <h4>Participation Metrics:</h4>
                  <div className="satellite-info-block-metrics">
                    <h5>Poll participation</h5>
                    <p>{participationMetrics.pollParticipation}%</p>
                    <h5>Proposal participation</h5>
                    <p>{participationMetrics.proposalParticipation}%</p>
                    <h5>Communication</h5>
                    <p>{participationMetrics.communication}%</p>
                  </div>
                </div>

                {satellite.proposalVotingHistory?.length ||
                satellite.financialRequestsVotes?.length ||
                satellite.emergencyGovernanceVotes?.length ? (
                  <div>
                    <h4>Voting History:</h4>
                    <div>
                      {satellite.proposalVotingHistory?.map((item) => renderVotingHistoryItem('Governance', item))}
                      {satellite.financialRequestsVotes?.map((item) =>
                        renderVotingHistoryItem('Financial Request', item),
                      )}
                      {satellite.emergencyGovernanceVotes?.map((item) =>
                        renderVotingHistoryItem('Emergency Governance', item),
                      )}
                    </div>
                  </div>
                ) : null}
              </SatelliteCardBottomRow>
            </SatelliteListCard>
          ) : (
            emptyContainer
          )}
        </div>
        <SatelliteSideBar />
      </PageContent>
    </Page>
  )
}
