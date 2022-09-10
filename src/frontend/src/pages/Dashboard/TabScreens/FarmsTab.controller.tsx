import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import { calculateAPR } from 'pages/Farms/Frams.helpers'
import React from 'react'
import { useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { State } from 'reducers'
import { FarmsContentStyled, TabWrapperStyled } from './DashboardTabs.style'

export const FarmsTab = () => {
  const { farmStorage } = useSelector((state: State) => state.farm)
  const history = useHistory()

  return (
    <TabWrapperStyled backgroundImage="dashboard_farmsTab_bg.png">
      <div className="top">
        <BGTitle>Yield Farms</BGTitle>
        <Button
          text="Farms"
          icon="plant"
          kind={ACTION_PRIMARY}
          className="noStroke"
          onClick={() => history.push('/yield-farms')}
        />
      </div>

      <FarmsContentStyled className="scroll-block">
        {farmStorage.map((farmCardData) => {
          const apr = calculateAPR(farmCardData.currentRewardPerBlock, farmCardData.lpTokenBalance)
          return (
            <Link to={`/yield-farms`}>
              <div className="card">
                <div className="top">
                  <div className="name">
                    <div className="large">{farmCardData.name}</div>
                    <TzAddress tzAddress={farmCardData.address} hasIcon type={CYAN} />
                  </div>

                  <Icon id="goldSilverCoinsMVK" />
                </div>

                <div className="row-info">
                  <div className="name">APR: </div>
                  <div className="value">{apr}</div>
                </div>

                <div className="row-info">
                  <div className="name">Earn: </div>
                  <div className="value">
                    <span style={{ color: 'red' }}>need data</span>
                  </div>
                </div>

                <div className="row-info">
                  <div className="name">Ends in: </div>
                  <div className="value">
                    <span style={{ color: 'red' }}>need data</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </FarmsContentStyled>

      <div className="descr">
        <div className="title">What is Yield Farming?</div>
        <div className="text">
          Liquidity providers will be able to stake their LP tokens within yield farms to receive sMVK as an incentive.
          The amount of sMVK rewards depends on how long the LP tokens are staked. By default, Mavryk farms are spawned
          for three months. <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
