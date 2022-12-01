import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'

import { borrowingData, CHART_TEST_DATA, lendingData } from '../tabs.const'
import { ACTION_PRIMARY, ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart.view'
import { SlidingTabButtons, TabItem } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import {
  DashboardPersonalTabStyled,
  LBHInfoBlock,
  ListItem,
  PortfolioWalletStyled,
  PortfolioChartStyled,
} from './DashboardPersonalComponents.style'

type PortfolioTabProps = {
  xtzAmount: number
  tzBTCAmount: number
  sMVKAmount: number
  notsMVKAmount: number
}

const TOGGLE_VALUES: TabItem[] = [
  { id: 1, text: '24H', active: true },
  { id: 3, text: '1W', active: false },
  { id: 4, text: '1M', active: false },
  { id: 5, text: '1Y', active: false },
  { id: 6, text: 'All', active: false },
]

const PortfolioTab = ({ xtzAmount, tzBTCAmount, sMVKAmount, notsMVKAmount }: PortfolioTabProps) => {
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const [toggleItems, setToggleItems] = useState<TabItem[]>(TOGGLE_VALUES)
  const lastSeria = CHART_TEST_DATA.at(-1)?.value ?? 0

  return (
    <DashboardPersonalTabStyled>
      <PortfolioChartStyled>
        <GovRightContainerTitleArea>
          <h2>MVK Earning History</h2>
        </GovRightContainerTitleArea>
        <div className="chart-periods">
          <SlidingTabButtons
            tabItems={toggleItems}
            onClick={(tabId) =>
              setToggleItems(
                toggleItems.map((item) =>
                  item.id === tabId
                    ? {
                        ...item,
                        active: true,
                      }
                    : {
                        ...item,
                        active: false,
                      },
                ),
              )
            }
          />
        </div>
        <div className="last-seria">
          <div className="mvk">
            <CommaNumber endingText="MVK" value={lastSeria} />
          </div>
          <div className="usd">
            <CommaNumber beginningText="$" value={lastSeria * exchangeRate} />
          </div>
        </div>
        <Chart
          data={CHART_TEST_DATA}
          colors={{
            lineColor: '#77A4F2',
            areaTopColor: '#77A4F2',
            areaBottomColor: 'rgba(119, 164, 242, 0)',
            textColor: '#CDCDCD',
          }}
          settings={{
            height: 260,
          }}
          className="portfolio"
        />
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
            <Link to="/loans">
              <Button text="Lend Asset" icon="lend" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
            </Link>
          </div>
        )}
      </LBHInfoBlock>
      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h2>Borrowing</h2>
        </GovRightContainerTitleArea>
        {borrowingData ? (
          <div className="list scroll-block">
            {borrowingData.map(({ assetImg, apy, supplied, earned, mvkBonus, id }) => {
              return (
                <ListItem columsTemplate="60px 0.9fr 0.7fr 0.8fr 0.7fr" key={id}>
                  <Icon id={assetImg || 'noImage'} />
                  <div className="list-part">
                    <div className="name">Borrowed</div>
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
            <span>Nothing borrowed at this time</span>
            <Link to="/yield-farms">
              <Button
                text="Borrow Asset"
                icon="borrow"
                kind={ACTION_PRIMARY}
                className="noStroke dashboard-sectionLink"
              />
            </Link>
          </div>
        )}
      </LBHInfoBlock>
    </DashboardPersonalTabStyled>
  )
}

export default PortfolioTab
