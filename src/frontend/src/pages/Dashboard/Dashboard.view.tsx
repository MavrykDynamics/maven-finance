import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import { Link } from 'react-router-dom'
import { mvkStatsType, TabId } from './Dashboard.controller'
import { DashboardStyled } from './Dashboard.style'
import { DashboardTab } from './TabScreens/DashboardTab.controller'

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
          <BGTitle>Mavryk TVL</BGTitle>
          <CommaNumber beginningText="$" value={tvl} />
        </div>

        <div className="mvkStats">
          <BGTitle>MVK</BGTitle>
          <div className="statsWrapper">
            <div className="stat">
              <div className="name">Market Cap</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.marketCap} endingText="USD" />
              </div>
            </div>

            <div className="stat">
              <div className="name">Staked MVK</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.stakedMvk} endingText="MVK" />
              </div>
            </div>

            <div className="stat">
              <div className="name">Live Price</div>
              <div className="value">
                <CommaNumber beginningText="$" value={mvkStatsBlock.livePrice} />
                <div className={`impact ${mvkStatsBlock.livePrice >= mvkStatsBlock.prevPrice ? 'up' : 'down'}`}>
                  {mvkStatsBlock.livePrice >= mvkStatsBlock.prevPrice ? '+' : '-'} 27%
                </div>
              </div>
            </div>

            <div className="stat">
              <div className="name">Circulating Supply</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.circuatingSupply} endingText="MVK" />
              </div>
            </div>

            <div className="stat">
              <div className="name">Max Supply</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.maxSupply} endingText="MVK" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-navigation">
        <Link to={'/dashboard?tab=lending'} className={activeTab === 'lending' ? 'selected' : ''}>
          Lending
        </Link>
        <Link to={'/dashboard?tab=vaults'} className={activeTab === 'vaults' ? 'selected' : ''}>
          Vaults
        </Link>
        <Link to={'/dashboard?tab=satellites'} className={activeTab === 'satellites' ? 'selected' : ''}>
          Satellites
        </Link>
        <Link to={'/dashboard?tab=treasury'} className={activeTab === 'treasury' ? 'selected' : ''}>
          Treasury
        </Link>
        <Link to={'/dashboard?tab=farms'} className={activeTab === 'farms' ? 'selected' : ''}>
          Farms
        </Link>
        <Link to={'/dashboard?tab=oracles'} className={activeTab === 'oracles' ? 'selected' : ''}>
          Oracles
        </Link>
      </div>

      <DashboardTab activeTab={activeTab} />
    </DashboardStyled>
  )
}
