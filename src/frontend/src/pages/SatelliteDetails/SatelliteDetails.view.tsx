import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Loader } from 'app/App.components/Loader/Loader.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { SatelliteCard, SatelliteCardRow, SatelliteCardTopRow, SatelliteMainText, SatelliteProfileImage, SatelliteProfileImageContainer, SatelliteSubText, SatelliteTextGroup, SideBySideImageAndText } from 'pages/Satellites/SatelliteList/SatellliteListCard/SatelliteListCard.style'
import { SatellitesHeader } from 'pages/Satellites/SatellitesHeader/SatellitesHeader.controller'
import { SatelliteSideBar } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { SatelliteRecord } from 'reducers/delegation'
import { Page, PageContent } from 'styles'

import { SatelliteCardBottomRow, SatelliteDescriptionText } from './SatelliteDetails.style'

type SatelliteDetailsViewProps = {
  satellite: SatelliteRecord | undefined
  loading: boolean
  delegateCallback: (address: string) => void
  undelegateCallback: (address: string) => void
}

export const SatelliteDetailsView = ({
  satellite,
  loading,
  delegateCallback,
  undelegateCallback,
}: SatelliteDetailsViewProps) => {
  const totalDelegatedMVK =
      parseFloat(satellite?.totalDelegatedAmount || '0') > 0
        ? parseFloat(satellite?.totalDelegatedAmount || '0') / 100000
        : 0,
    myDelegatedMVK =
      parseFloat(satellite?.totalDelegatedAmount || '0') > 0
        ? parseFloat(satellite?.totalDelegatedAmount || '0') / 100000
        : 0

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
      <SatellitesHeader />
      <br />
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
          <SatelliteCard key={satellite.address}>
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
                  <CommaNumber value={myDelegatedMVK} />
                </SatelliteMainText>
                <SatelliteSubText>Your delegated MVK</SatelliteSubText>
              </SatelliteTextGroup>
              <Button
                text="Delegate"
                icon="man-check"
                loading={loading}
                onClick={() => delegateCallback(satellite.address)}
              />
              <div>Put last voted here</div>
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
            <ColoredLine kind="secondary" />
            <SatelliteCardBottomRow>
              <div>
                <h4>Description:</h4>
                <div>{parse(satellite.description, options)}</div>
              </div>
              <div>
                <h4>Voting History:</h4>
              </div>
              <div>
                <h4>Participation Metrics:</h4>
              </div>
            </SatelliteCardBottomRow>
          </SatelliteCard>
        )}
        <SatelliteSideBar />
      </PageContent>
    </Page>
  )
}
