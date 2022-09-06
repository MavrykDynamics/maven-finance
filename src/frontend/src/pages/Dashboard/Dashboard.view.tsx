import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { mvkStatsType } from './Dashboard.controller'
import { DashboardStyled } from './Dashboard.style'

export const DashboardView = ({ tvl, mvkStatsBlock }: { tvl: number; mvkStatsBlock: mvkStatsType }) => {
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
                <CommaNumber value={mvkStatsBlock.livePrice} />
                <div className={`impact ${mvkStatsBlock.livePrice >= mvkStatsBlock.prevPrice ? 'up' : 'down'}`}>
                  27%
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
    </DashboardStyled>
  )
}
