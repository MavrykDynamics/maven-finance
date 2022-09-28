import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { Link, Redirect, Route, Switch } from 'react-router-dom'
import { DashboardStyled, StatBlock } from './Dashboard.style'
import {
  FARMS_TAB_ID,
  LENDING_TAB_ID,
  mvkStatsType,
  ORACLES_TAB_ID,
  SATELLITES_TAB_ID,
  TabId,
  TREASURY_TAB_ID,
  VAULTS_TAB_ID,
} from './Dashboard.utils'
import { FarmsTab } from './TabScreens/FarmsTab.controller'
import { LendingTab } from './TabScreens/LendingTab.controller'
import { OraclesTab } from './TabScreens/OraclesTab.controller'
import { SatellitesTab } from './TabScreens/SatellitesTab.controller'
import { TreasuryTab } from './TabScreens/TreasuryTab.controller'
import { VaultsTab } from './TabScreens/VaultsTab.controller'

export const DashboardView = ({
  tvl,
  mvkStatsBlock,
  activeTab,
}: {
  tvl: number
  mvkStatsBlock: mvkStatsType
  activeTab: TabId
}) => {
  return (
    <DashboardStyled>
      <div className="top">
        <div className="tvlBlock">
          <BGPrimaryTitle>Mavryk TVL</BGPrimaryTitle>
          <CommaNumber beginningText="$" value={tvl} />
        </div>

        <div className="mvkStats">
          <BGPrimaryTitle>MVK</BGPrimaryTitle>
          <div className="statsWrapper">
            <StatBlock>
              <div className="name">Market Cap</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.marketCap} endingText="USD" />
              </div>
            </StatBlock>

            <StatBlock>
              <div className="name">Staked MVK</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.stakedMvk} endingText="MVK" />
              </div>
            </StatBlock>

            <StatBlock>
              <div className="name">Live Price</div>
              <div className="value">
                <CommaNumber beginningText="$" value={mvkStatsBlock.livePrice} />
                <div className={`impact ${mvkStatsBlock.livePrice >= mvkStatsBlock.prevPrice ? 'up' : 'down'}`}>
                  {mvkStatsBlock.livePrice >= mvkStatsBlock.prevPrice ? '+' : '-'}{' '}
                  {mvkStatsBlock.livePrice * 100 - mvkStatsBlock.prevPrice * 100}%
                </div>
              </div>
            </StatBlock>

            <StatBlock>
              <div className="name">Circulating Supply</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.circuatingSupply} endingText="MVK" />
              </div>
            </StatBlock>

            <StatBlock>
              <div className="name">Max Supply</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.maxSupply} endingText="MVK" />
              </div>
            </StatBlock>
          </div>
        </div>
      </div>

      <div className="dashboard-navigation">
        <Link to={`/dashboard/${LENDING_TAB_ID}`} className={activeTab === LENDING_TAB_ID ? 'selected' : ''}>
          Lending
        </Link>
        <Link to={`/dashboard/${VAULTS_TAB_ID}`} className={activeTab === VAULTS_TAB_ID ? 'selected' : ''}>
          Vaults
        </Link>
        <Link to={`/dashboard/${SATELLITES_TAB_ID}`} className={activeTab === SATELLITES_TAB_ID ? 'selected' : ''}>
          Satellites
        </Link>
        <Link to={`/dashboard/${TREASURY_TAB_ID}`} className={activeTab === TREASURY_TAB_ID ? 'selected' : ''}>
          Treasury
        </Link>
        <Link to={`/dashboard/${FARMS_TAB_ID}`} className={activeTab === FARMS_TAB_ID ? 'selected' : ''}>
          Farms
        </Link>
        <Link to={`/dashboard/${ORACLES_TAB_ID}`} className={activeTab === ORACLES_TAB_ID ? 'selected' : ''}>
          Oracles
        </Link>
      </div>

      <Switch>
        <Route exact path={`/dashboard/${FARMS_TAB_ID}`}>
          <FarmsTab />
        </Route>
        <Route exact path={`/dashboard/${VAULTS_TAB_ID}`}>
          <VaultsTab />
        </Route>
        <Route exact path={`/dashboard/${SATELLITES_TAB_ID}`}>
          <SatellitesTab />
        </Route>
        <Route exact path={`/dashboard/${ORACLES_TAB_ID}`}>
          <OraclesTab />
        </Route>
        <Route exact path={`/dashboard/${TREASURY_TAB_ID}`}>
          <TreasuryTab />
        </Route>
        <Route path={`/dashboard/${LENDING_TAB_ID}`}>
          <LendingTab />
        </Route>
        <Redirect to={`/dashboard/${LENDING_TAB_ID}`} />
      </Switch>
    </DashboardStyled>
  )
}
