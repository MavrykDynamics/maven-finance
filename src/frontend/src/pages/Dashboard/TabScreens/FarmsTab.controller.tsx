import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import CoinsIcons from 'app/App.components/Icon/CoinsIcons.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { EmptyContainer } from 'app/App.style'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import { calculateAPR } from 'pages/Farms/Frams.helpers'
import qs from 'qs'
import { useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { State } from 'reducers'
import { FarmsContentStyled, TabWrapperStyled } from './DashboardTabs.style'

const emptyContainer = (
  <EmptyContainer className="empty-container">
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No live farms to show</figcaption>
  </EmptyContainer>
)

export const FarmsTab = () => {
  const { farmStorage } = useSelector((state: State) => state.farm)
  const history = useHistory()
  const hasLiveFarms = farmStorage.some(({ isLive }) => !isLive)

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
        {hasLiveFarms
          ? farmStorage.map((farmCardData) => {
              // if (!farmCardData.isLive) return null

              const apr = calculateAPR(farmCardData.currentRewardPerBlock, farmCardData.lpTokenBalance)
              return (
                <Link
                  to={`/yield-farms?${qs.stringify({ openedCards: [farmCardData.address] })}`}
                  key={farmCardData.address + farmCardData.name}
                >
                  <div className="card">
                    <div className="top">
                      <div className="name">
                        <div className="large">{farmCardData.name}</div>
                        <TzAddress tzAddress={farmCardData.address} hasIcon type={CYAN} />
                      </div>

                      <CoinsIcons />
                    </div>

                    <div className="row-info">
                      <div className="name">APR: </div>
                      <div className="value">{apr}</div>
                    </div>

                    <div className="row-info">
                      <div className="name">Earn: </div>
                      <div className="value">sMVK + Fees</div>
                    </div>

                    <div className="row-info">
                      <div className="name">Ends in: </div>
                      <div className="value">
                        <Timer deadline={farmCardData.endsIn} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          : emptyContainer}
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
