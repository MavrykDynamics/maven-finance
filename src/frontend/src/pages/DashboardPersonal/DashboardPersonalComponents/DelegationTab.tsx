import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { Link } from 'react-router-dom'
import { DelegationTabStyled, LBHInfoBlock, DelegationStatusBlock, ListItem } from './DashboardPersonalComponents.style'

const lendingData = [
  {
    assetImg: '',
    supplied: 1000,
    apy: 10,
    earned: 500,
    mvkBonus: 4500,
  },
  {
    assetImg: '',
    supplied: 1000,
    apy: 10,
    earned: 500,
    mvkBonus: 4500,
  },
  {
    assetImg: '',
    supplied: 1000,
    apy: 10,
    earned: 500,
    mvkBonus: 4500,
  },
  {
    assetImg: '',
    supplied: 1000,
    apy: 10,
    earned: 500,
    mvkBonus: 4500,
  },
  {
    assetImg: '',
    supplied: 1000,
    apy: 10,
    earned: 500,
    mvkBonus: 4500,
  },
  {
    assetImg: '',
    supplied: 1000,
    apy: 10,
    earned: 500,
    mvkBonus: 4500,
  },
]

const historyData = [
  {
    action: 'stake',
    amount: 333,
    exitFee: 0.84,
    totalAmount: 322232,
  },
  {
    action: 'stake',
    amount: 333,
  },
  {
    action: 'stake',
    amount: 333,
    totalAmount: 322232,
  },
  {
    action: 'stake',
    amount: 333,
    exitFee: 0.84,
  },
  {
    action: 'stake',
    amount: 333,
    user: {
      avatar: '',
      address: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb',
      name: 'Jeff Stone',
    },
  },
]

const DelegationTab = () => {
  return (
    <DelegationTabStyled>
      <DelegationStatusBlock>
        <GovRightContainerTitleArea>
          <h1>Delegation Status</h1>
        </GovRightContainerTitleArea>
      </DelegationStatusBlock>
      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h1>History</h1>
        </GovRightContainerTitleArea>
        {historyData ? (
          <div className="list scroll-block">
            {historyData.map(({ action, amount, exitFee, totalAmount, user }) => {
              return (
                <ListItem columsTemplate={`25% 25% ${user ? '50%' : ' 25% 25%'}  `}>
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
          <h1>Lending</h1>
        </GovRightContainerTitleArea>
        {lendingData ? (
          <div className="list scroll-block">
            {lendingData.map(({ assetImg, apy, supplied, earned, mvkBonus }) => {
              return (
                <ListItem columsTemplate="60px 0.9fr 0.7fr 0.8fr 0.7fr">
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
          <h1>Borrowing</h1>
        </GovRightContainerTitleArea>
        <div className="no-data">
          <span>Nothing borrowed at this time</span>
          <Link to="/yield-farms">
            <Button text="Borrow Asset" icon="plant" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
          </Link>
        </div>
      </LBHInfoBlock>
    </DelegationTabStyled>
  )
}

export default DelegationTab
