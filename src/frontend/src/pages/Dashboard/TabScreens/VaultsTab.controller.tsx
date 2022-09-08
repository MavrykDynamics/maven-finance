import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { SimpleTable } from 'app/App.components/SimpleTable/SimpleTable.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { StatBlock, BlockName } from '../Dashboard.style'
import { TabWrapperStyled, VaultsContentStyled } from './DashboardTabs.style'
import { columnNames, tableData, fieldsMapper } from './TreasuryTab.controller'

export const VaultsTab = () => {
  return (
    <TabWrapperStyled className="vaults">
      <div className="top">
        <BGTitle>Vaults</BGTitle>
        <Button text="Vaults" icon="vaults" kind={ACTION_PRIMARY} className="noStroke" />
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
              data={tableData}
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
