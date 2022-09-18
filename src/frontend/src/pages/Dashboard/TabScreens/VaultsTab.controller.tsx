import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import PieChartView from 'app/App.components/PieСhart/PieСhart.view'
import { SimpleTable } from 'app/App.components/SimpleTable/SimpleTable.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import { getPieChartData } from 'pages/Treasury/helpers/calculateChartData'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { State } from 'reducers'
import { TreasuryBalanceType } from 'utils/TypesAndInterfaces/Treasury'
import { StatBlock, BlockName } from '../Dashboard.style'
import { calcTreasuryAseetsToTableDataFormat } from '../Dashboard.utils'
import { TabWrapperStyled, VaultsContentStyled } from './DashboardTabs.style'
import { columnNames, fieldsMapper } from './TreasuryTab.controller'

export const VaultsTab = () => {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)

  const history = useHistory()

  const { treasuryStorage } = useSelector((state: State) => state.treasury)

  const { assets, globalTreasury } = useMemo(
    () => calcTreasuryAseetsToTableDataFormat(treasuryStorage),
    [treasuryStorage],
  )
  const treasuryAssetsArray = Object.values(assets)

  const chartData = useMemo(() => {
    return getPieChartData(treasuryAssetsArray, globalTreasury, hoveredPath)
  }, [hoveredPath, globalTreasury, treasuryAssetsArray])

  return (
    <TabWrapperStyled className="vaults">
      <div className="top">
        <BGTitle>Vaults</BGTitle>
        <Button
          text="Vaults"
          icon="vaults"
          kind={ACTION_PRIMARY}
          className="noStroke"
          onClick={() => history.push('/vaults')}
        />
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
              data={treasuryAssetsArray}
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
              {treasuryAssetsArray.map((balanceValue) => (
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
