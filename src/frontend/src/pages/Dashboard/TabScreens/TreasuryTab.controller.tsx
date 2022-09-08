import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { BlockName, StatBlock } from '../Dashboard.style'
import { TabWrapperStyled, TreasuryContentStyled } from './DashboardTabs.style'

const tableData = [
  {
    asset: 'MVK',
    amount: 234243242,
    usdValue: 32423424,
  },
  {
    asset: 'XTZ',
    amount: 234243242,
    usdValue: 32423424,
  },
  {
    asset: 'tzBTC',
    amount: 234243242,
    usdValue: 32423424,
  },
  {
    asset: 'USDT',
    amount: 234243242,
    usdValue: 32423424,
  },
]

export const TreasuryTab = () => {
  return (
    <TabWrapperStyled backgroundImage="dashboard_treasuryTab_bg.png">
      <div className="top">
        <BGTitle>Treasury</BGTitle>
        <Button text="Treasury" icon="treasury" kind={ACTION_PRIMARY} className="noStroke" />
      </div>

      <TreasuryContentStyled>
        <div className="top">
          <StatBlock>
            <div className="name">Total Oracle Rewards Paid</div>
            <div className="value">
              <CommaNumber endingText="USD" value={124141} />
            </div>
          </StatBlock>
          <StatBlock>
            <div className="name">Total Oracle Feeds</div>
            <div className="value">
              <CommaNumber endingText="USD" value={124141} />
            </div>
          </StatBlock>
        </div>
        <div className="container">
          <div>
            <BlockName>Treasury Assets</BlockName>

            <div className="table-wrapper">
              <div className="row column-names">
                <div className="row-item">Asset</div>
                <div className="row-item">Amount</div>
                <div className="row-item">USD Value</div>
              </div>

              <div className="table-content scroll-block">
                {tableData.map((item) => (
                  <div className="row">
                    <div className="row-item">{item.asset}</div>
                    <div className="row-item">
                      <CommaNumber value={item.amount} />
                    </div>
                    <div className="row-item">
                      <CommaNumber beginningText="$" value={item.usdValue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <BlockName>Token Vesting</BlockName>
          </div>
        </div>
      </TreasuryContentStyled>

      <div className="descr">
        <div className="title">What is the purpose of the Treasury?</div>
        <div className="text">
          The treasury is managed by the Mavryk DAO through on chain voting. Governance votes, whether for the business
          logic or upgrades to the Mavryk ecosystem, are rewarded with a portion of the earned income from the on-chain
          Treasury. <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
