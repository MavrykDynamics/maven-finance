import { Link } from 'react-router-dom'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import {
  DashboardPersonalTabStyled,
  LBHInfoBlock,
  DelegationStatusBlock,
  ListItem,
} from './DashboardPersonalComponents.style'

import { historyData, lendingData } from '../tabs.const'

const DelegationTab = () => {
  return (
    <DashboardPersonalTabStyled>
      <DelegationStatusBlock>
        <GovRightContainerTitleArea>
          <h2>Delegation Status</h2>
        </GovRightContainerTitleArea>
      </DelegationStatusBlock>
      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h2>History</h2>
        </GovRightContainerTitleArea>
        {historyData ? (
          <div className="list scroll-block">
            {historyData.map(({ action, amount, exitFee, totalAmount, user, id }) => {
              return (
                <ListItem columsTemplate={`25% 25% ${user ? '50%' : ' 25% 25%'}  `} key={id + action}>
                  <div className="list-part">
                    <div className="name">Action</div>
                    <div className="value">{action}</div>
                  </div>
                  <div className="list-part">
                    <div className="name">Amount</div>
                    <div className="value">
                      <CommaNumber value={amount} endingText="MVK" />
                    </div>
                  </div>
                  {exitFee ? (
                    <div className="list-part">
                      <div className="name">Exit Fee</div>
                      <div className="value">
                        <CommaNumber value={exitFee} endingText="%" />
                      </div>
                    </div>
                  ) : (
                    !user && <div className="list-part" />
                  )}
                  {totalAmount ? (
                    <div className="list-part">
                      <div className="name">Total Amount</div>
                      <div className="value">
                        <CommaNumber value={totalAmount} endingText="MVK" />
                      </div>
                    </div>
                  ) : (
                    !user && <div className="list-part" />
                  )}
                  {user ? (
                    <div className="list-part user">
                      <Icon id={user.avatar || 'noImage'} />
                      <div className="user-info">
                        <div className="name">{user.name}</div>
                        <TzAddress tzAddress={user.address} className="value user-address" hasIcon={true} />
                      </div>
                    </div>
                  ) : null}
                </ListItem>
              )
            })}
          </div>
        ) : (
          <div className="no-data">
            <span>You do not have any previous delegation history</span>
          </div>
        )}
      </LBHInfoBlock>
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

export default DelegationTab
