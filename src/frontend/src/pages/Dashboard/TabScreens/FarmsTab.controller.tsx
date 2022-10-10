import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import CoinsIcons from 'app/App.components/Icon/CoinsIcons.view'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { EmptyContainer } from 'app/App.style'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { calculateAPY } from 'pages/Farms/Farms.helpers'
import qs from 'qs'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { FarmsContentStyled, TabWrapperStyled } from './DashboardTabs.style'

const emptyContainer = (
  <EmptyContainer className="empty-container">
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No live farms to show</figcaption>
  </EmptyContainer>
)

export const FarmsTab = () => {
  const dispatch = useDispatch()
  const { farmStorage } = useSelector((state: State) => state.farm)
  const hasLiveFarms = useMemo(() => farmStorage.some(({ isLive }) => isLive), [farmStorage])

  useEffect(() => {
    dispatch(getFarmStorage())
  }, [])

  return (
    <TabWrapperStyled backgroundImage="dashboard_farmsTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Yield Farms</BGPrimaryTitle>
        <Link to="/yield-farms">
          <Button text="Farms" icon="plant" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      <FarmsContentStyled className="scroll-block">
        {hasLiveFarms
          ? farmStorage.map((farmCardData) => {
              if (!farmCardData.isLive) return null

              const apy = calculateAPY(farmCardData.currentRewardPerBlock, farmCardData.lpBalance)
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
                      <div className="name">APY: </div>
                      <div className="value">{apy}</div>
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
