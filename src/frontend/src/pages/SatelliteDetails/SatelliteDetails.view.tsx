import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Loader } from 'app/App.components/Loader/Loader.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser'
// prettier-ignore
import { SatelliteCard, SatelliteCardRow, SatelliteCardTopRow, SatelliteMainText, SatelliteProfileImage, SatelliteProfileImageContainer, SatelliteSubText, SatelliteTextGroup, SideBySideImageAndText } from 'pages/Satellites/SatelliteList/SatellliteListCard/SatelliteListCard.style'
import { SatelliteListCard } from 'pages/Satellites/SatelliteList/SatellliteListCard/SatelliteListCard.view'
import { SatelliteSideBar } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import * as React from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { Page, PageContent } from 'styles'

import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DOWN } from '../../app/App.components/StatusFlag/StatusFlag.constants'
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import { SatelliteCardBottomRow, SatelliteDescriptionText } from './SatelliteDetails.style'

type SatelliteDetailsViewProps = {
  satellite: SatelliteRecord
  loading: boolean
  delegateCallback: (address: string) => void
  undelegateCallback: (address: string) => void
  userStakedBalanceInSatellite: number
}

export const SatelliteDetailsView = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
  userStakedBalanceInSatellite,
}: SatelliteDetailsViewProps) => {
  const { user } = useSelector((state: State) => state.user)
  const { participationMetrics } = useSelector((state: State) => state.delegation)
  const totalDelegatedMVK = satellite?.totalDelegatedAmount ?? 0
  const myDelegatedMVK = userStakedBalanceInSatellite

  console.log('%c ||||| satellite', 'color:yellowgreen', satellite)

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
  return (
    <Page>
      <PageHeader page={'satellites'} kind={PRIMARY} loading={loading} />
      <PageContent>
        {!satellite && <Loader />}
        {satellite && satellite.address === 'None' && (
          <SatelliteCard>
            <SatelliteCardTopRow>No Satellite found..</SatelliteCardTopRow>
            <div>
              <Link to="/satellites/">
                <Button text="To Satellites" icon="satellite" kind="primary" />
              </Link>
            </div>
          </SatelliteCard>
        )}
        {satellite && satellite.address !== 'None' && (
          <SatelliteListCard
            satellite={satellite}
            loading={loading}
            delegateCallback={delegateCallback}
            undelegateCallback={undelegateCallback}
            userStakedBalance={myDelegatedMVK}
            satelliteUserIsDelegatedTo={user.satelliteMvkIsDelegatedTo}
            isDetaisPage
          >
            <SatelliteCardBottomRow>
              <div className="descr satellite-info-block">
                <h4>Description:</h4>
                <p>{parse(satellite.description, options)}</p>

                <a className="satellite-website" href={satellite.website} target="_blank" rel="noreferrer">
                  Website
                </a>
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

              {satellite.proposalVotingHistory?.length ? (
                <div>
                  <h4>Voting History:</h4>
                  <div>
                    {satellite.proposalVotingHistory.map((item) => {
                      return (
                        <div className="satellite-voting-history" key={item.id}>
                          <p>Proposal 42 - Adjusting Auction Parameters</p>
                          <span>
                            Voted {item.vote ? <b className="voting-yes">YES </b> : <b className="voting-no">NO </b>}
                            on <Time value={item.timestamp} format="M d\t\h, Y" />
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </SatelliteCardBottomRow>
          </SatelliteListCard>
        )}
        <SatelliteSideBar />
      </PageContent>
    </Page>
  )
}
