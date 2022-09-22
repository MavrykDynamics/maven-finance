import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import PieChartView from 'app/App.components/PieСhart/PieСhart.view'
import { SimpleTable } from 'app/App.components/SimpleTable/SimpleTable.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import { getPieChartData } from 'pages/Treasury/helpers/calculateChartData'
import { reduceTreasuryAssets } from 'pages/Treasury/Treasury.helpers'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { StatBlock, BlockName } from '../Dashboard.style'
import { TabWrapperStyled, VaultsContentStyled } from './DashboardTabs.style'
import { columnNames, fieldsMapper } from './TreasuryTab.controller'

export const VaultsTab = () => {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)

  const { treasuryStorage } = useSelector((state: State) => state.treasury)

  const { assetsBalances, globalTreasuryTVL } = useMemo(() => reduceTreasuryAssets(treasuryStorage), [treasuryStorage])

  const chartData = useMemo(() => {
    return getPieChartData(assetsBalances, globalTreasuryTVL, hoveredPath)
  }, [hoveredPath, assetsBalances, globalTreasuryTVL])

  return (
    <TabWrapperStyled className="vaults">
      <div className="top">
        <BGTitle>Vaults</BGTitle>
        <Link to="/vaults">
          <Button text="Vaults" icon="vaults" kind={ACTION_PRIMARY} className="noStroke" />
        </Link>
      </div>

      <VaultsContentStyled>
        <div className="top">
          <StatBlock>
            <div className="name">Active Vaults</div>
            <div className="value">
              <CommaNumber value={1234} />
            </div>
          </StatBlock>
          <StatBlock>
            <div className="name">Collateral Ratio</div>
            <div className="value">
              <CommaNumber endingText="%" value={123} />
            </div>
          </StatBlock>
          <StatBlock>
            <div className="name">Avg Collateral Ratio</div>
            <div className="value">
              <CommaNumber endingText="%" value={333} />
            </div>
          </StatBlock>
        </div>

        <div className="container">
          <div>
            <BlockName>Treasury Assets</BlockName>

            <SimpleTable
              colunmNames={columnNames}
              data={assetsBalances}
              fieldsMapper={fieldsMapper}
              className="dashboard-st vaults"
            />

            <div className="summary">
              <div className="name">Vault TVL</div>
              <div className="value">
                <CommaNumber beginningText="$" value={34324234234.02} />
              </div>
            </div>
          </div>
          <div className="chart-wrapper">
            <PieChartView chartData={chartData} />

            <div className="asset-lables scroll-block">
              {assetsBalances.map((balanceValue) => (
                <div
                  style={{
                    background: `linear-gradient(90deg,${
                      chartData.find(
                        ({ title }) => title === balanceValue.symbol || title.includes(balanceValue.symbol),
                      )?.color
                    } 0%,rgba(255,255,255,0) 100%)`,
                  }}
                  className="asset-lable"
                  onMouseEnter={() => {
                    setHoveredPath(balanceValue.symbol)
                  }}
                  onMouseLeave={() => setHoveredPath(null)}
                  key={balanceValue.contract}
                >
                  <p className="asset-lable-text">{balanceValue.symbol}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </VaultsContentStyled>

      <div className="descr">
        <div className="title">What is a Vault?</div>
        <div className="text">
          The treasury is managed by the Mavryk DAO through on chain voting. Governance votes, whether for the business
          logic or upgrades to the Mavryk ecosystem, are rewarded with a portion of the earned income from the on-chain
          Treasury <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
