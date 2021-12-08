import { Button } from 'app/App.components/Button/Button.controller'
import { ColoredLine } from 'app/App.components/ColoredLine/ColoredLine.view'
import {
  SatelliteCard,
  SatelliteCardBottomRow,
  SatelliteCardTopRow,
  SatelliteMainText,
  SatelliteProfileImage,
  SatelliteProfileImageContainer,
  SatelliteSubText,
  SatelliteTextGroup,
  SideBySideImageAndText,
} from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { getDelegationStorage, setChosenSatellite } from 'pages/Satellites/Satellites.actions'
import { SatellitesHeader } from 'pages/Satellites/SatellitesHeader/SatellitesHeader.controller'
import { SatelliteSideBar } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.view'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'
import { Message, Page, PageContent } from 'styles'

export const SatelliteDetails = (props: any) => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { vMvkTokenStorage, myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)
  const { chosenSatellite } = useSelector((state: State) => state.routing)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage
  const [satellite, setSatellite] = useState<any>(chosenSatellite)

  useEffect(() => {
    let isMounted = true
    dispatch(getDelegationStorage())
    if (chosenSatellite === undefined) {
      const pathAddress = props.match.params.satelliteId
      const neededSatellite = satelliteLedger.filter((item: SatelliteRecord) => item.address === pathAddress)[0]
      setSatellite(neededSatellite)
      dispatch(setChosenSatellite(neededSatellite))
    }
    return () => {
      isMounted = false
    }
  }, [chosenSatellite, dispatch, props, satelliteLedger])

  const delegateCallback = () => {
    // dispatch(stake(amount))
  }

  const undelegateCallback = () => {
    // dispatch(showExitFeeModal(amount))
  }
  return (
    <Page>
      <SatellitesHeader />
      <br />
      <PageContent>
        {chosenSatellite !== undefined ? (
          <SatelliteCard key={satellite.address}>
            <SatelliteCardTopRow>
              <SideBySideImageAndText>
                <SatelliteProfileImageContainer>
                  <SatelliteProfileImage src={satellite.image} />
                </SatelliteProfileImageContainer>
                <SatelliteTextGroup>
                  <SatelliteMainText>{satellite.name}</SatelliteMainText>
                  <SatelliteSubText>{`${satellite.address.slice(0, 7)}...${satellite.address.slice(
                    satellite.address.length - 4,
                    satellite.address.length,
                  )}`}</SatelliteSubText>
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
              <Button text="Delegate" icon="man-check" loading={loading} onClick={() => delegateCallback()} />
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
                onClick={() => delegateCallback()}
              />
            </SatelliteCardTopRow>
            <ColoredLine kind="secondary" />
            <SatelliteCardBottomRow>
              Currently supporting Proposal 42 - Adjusting Auction Parameters
            </SatelliteCardBottomRow>
            <ColoredLine kind="secondary" />
            <SatelliteCardBottomRow>{satellite.description}</SatelliteCardBottomRow>
          </SatelliteCard>
        ) : (
          <div></div>
        )}

        <SatelliteSideBar />
      </PageContent>
    </Page>
  )
}
