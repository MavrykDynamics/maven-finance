import { Link } from 'react-router-dom'

import { ACTION_PRIMARY, ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import {
  DashboardPersonalTabStyled,
  LBHInfoBlock,
  ListItem,
  PortfolioWalletStyled,
  PortfolioChartStyled,
} from './DashboardPersonalComponents.style'

import { lendingData } from '../tabs.const'

type PortfolioTabProps = {
  xtzAmount: number
  tzBTCAmount: number
  sMVKAmount: number
  notsMVKAmount: number
}

const PortfolioTab = ({ xtzAmount, tzBTCAmount, sMVKAmount, notsMVKAmount }: PortfolioTabProps) => {
  return (
    <DashboardPersonalTabStyled>
      <PortfolioChartStyled>
        <GovRightContainerTitleArea>
          <h2>MVK Earning History</h2>
        </GovRightContainerTitleArea>
      </PortfolioChartStyled>

      <PortfolioWalletStyled>
        <GovRightContainerTitleArea>
          <h2>Wallet</h2>
        </GovRightContainerTitleArea>
        <div className="wallet-info">
          <div className="name">Staked MVK</div>
          <div className="value">
            <CommaNumber value={sMVKAmount} />
            <Button text="View" className="no-before" kind={ACTION_SIMPLE} />
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">MVK Not Staked</div>
          <div className="value">
            <CommaNumber value={notsMVKAmount} />
            <Button text="Stake" className="no-before" kind={ACTION_SIMPLE} />
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">XTZ in Wallet</div>
          <div className="value">
            <CommaNumber value={xtzAmount} />
            <Button text="Delegate" className="no-before" kind={ACTION_SIMPLE} />
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">tzBTC in Wallet</div>
          <div className="value">
            <CommaNumber value={tzBTCAmount} />
            <Button text="Borrow" className="no-before" kind={ACTION_SIMPLE} />
          </div>
        </div>
      </PortfolioWalletStyled>

      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h2>Lending</h2>
        </GovRightContainerTitleArea>
        {lendingData ? (
          <div className="list scroll-block">
            {lendingData.map(({ assetImg, apy, supplied, earned, mvkBonus, id }) => {
              return (
                <ListItem columsTemplate="60px 0.9fr 0.7fr 0.8fr 0.7fr" key={id}>
                  <Icon id={assetImg || 'noImage'} />
                  <div className="list-part">
                    <div className="name">Supplied</div>
                    <div className="value">
                      <CommaNumber value={supplied} beginningText="$" />
                    </div>
                  </div>
                  <div className="list-part">
                    <div className="name">APY</div>
                    <div className="value">
                      <CommaNumber value={apy} endingText="%" />
                    </div>
                  </div>
                  <div className="list-part">
                    <div className="name">Earned</div>
                    <div className="value">
                      <CommaNumber value={earned} />
                    </div>
                  </div>
                  <div className="list-part">
                    <div className="name">MVK Bonus</div>
                    <div className="value">
                      <CommaNumber value={mvkBonus} />
                    </div>
                  </div>
                </ListItem>
              )
            })}
          </div>
        ) : (
          <div className="no-data">
            <span>Nothing supplied at this time</span>
            <Link to="/yield-farms">
              <Button text="Lend Asset" icon="plant" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
            </Link>
          </div>
        )}
      </LBHInfoBlock>
      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h2>Borrowing</h2>
        </GovRightContainerTitleArea>
        <div className="no-data">
          <span>Nothing borrowed at this time</span>
          <Link to="/yield-farms">
            <Button text="Borrow Asset" icon="plant" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
          </Link>
        </div>
      </LBHInfoBlock>
    </DashboardPersonalTabStyled>
  )
}

export default PortfolioTab
