import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { Link } from 'react-router-dom'
import { StatBlock } from '../Dashboard.style'
import { LendingContentStyled, TabWrapperStyled } from './DashboardTabs.style'

export const LendingTab = () => {
  return (
    <TabWrapperStyled backgroundImage="dashboard_lendingTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Lending</BGPrimaryTitle>
        <Link to="/loans">
          <Button text="Loans" icon="coin-loan" kind={ACTION_PRIMARY} className="noStroke" />
        </Link>
      </div>

      <LendingContentStyled>
        <div className="left">
          <StatBlock className="large">
            <div className="name">Total Supplied</div>
            <div className="value">
              <CommaNumber beginningText="$" value={23452342342} />
              <div className={`impact ${false ? 'up' : 'down'}`}>{false ? '+' : '-'} 27%</div>
            </div>
          </StatBlock>

          <div className="stats-row">
            <StatBlock>
              <div className="name">Suppliers</div>
              <div className="value">
                <CommaNumber value={12432} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">24H Supply Vol</div>
              <div className="value">
                <CommaNumber beginningText="$" value={23452342342} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">Most Supplied Asset</div>
              <div className="value">
                <Icon id="mvkTokenGold" /> EUR
              </div>
            </StatBlock>
          </div>
        </div>
        <div className="spacer" />
        <div className="right">
          <StatBlock className="large">
            <div className="name">Total Borrowed</div>
            <div className="value">
              <CommaNumber beginningText="$" value={23452342342} />
              <div className={`impact ${true ? 'up' : 'down'}`}>{true ? '+' : '-'} 27%</div>
            </div>
          </StatBlock>

          <div className="stats-row">
            <StatBlock>
              <div className="name">Borrowers</div>
              <div className="value">
                <CommaNumber value={12432} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">24H Borrow Vol</div>
              <div className="value">
                <CommaNumber beginningText="$" value={23452342342} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">Most Borrowed Asset</div>
              <div className="value">
                <Icon id="mvkTokenGold" /> EUR
              </div>
            </StatBlock>
          </div>
        </div>
      </LendingContentStyled>

      <div className="descr">
        <div className="title">How does Lending work on Mavyrk?</div>
        <div className="text">
          Mavryk allows its users to put up existing crypto-assets as equity for a stablecoin loan, up to a 50%
          loan-to-value ratio. Likewise, suppliers can loan out their crypto-assets to receive interest.{' '}
          <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
