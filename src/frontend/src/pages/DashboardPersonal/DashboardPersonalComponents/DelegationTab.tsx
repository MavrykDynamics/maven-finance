import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

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

import { borrowingData, historyData, lendingData } from '../tabs.const'
import { getSatelliteMetrics } from 'pages/Satellites/Satellites.helpers'

const DelegationTab = () => {
  const { satelliteMvkIsDelegatedTo } = useSelector((state: State) => state.wallet.user)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)
  const satelliteInfo = satelliteLedger.find(({ address }) => satelliteMvkIsDelegatedTo === address)

  const {
    governanceStorage: { financialRequestLedger, proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const {
    emergencyGovernanceStorage: { emergencyGovernanceLedger },
  } = useSelector((state: State) => state.emergencyGovernance)
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)

  const satelliteMetrics = satelliteInfo
    ? getSatelliteMetrics(
        pastProposals,
        proposalLedger,
        emergencyGovernanceLedger,
        satelliteInfo,
        feeds,
        financialRequestLedger,
      )
    : null

  return (
    <DashboardPersonalTabStyled>
      <DelegationStatusBlock>
        <GovRightContainerTitleArea>
          <h2>Delegation Status</h2>
        </GovRightContainerTitleArea>
        {satelliteMvkIsDelegatedTo && satelliteInfo && satelliteMetrics ? (
          <>
            <div className="delegated-to">Delegated To</div>
            <div className="grid">
              <div className="grid-item info">
                {satelliteInfo.image ? (
                  <div className="satellite-avatar">
                    <img src={satelliteInfo.image} alt="satellite logo" />
                  </div>
                ) : (
                  <Icon id="noImage" />
                )}
                <div className="text">
                  <div className="name">{satelliteInfo.name}</div>
                  <div className="value">
                    <TzAddress tzAddress={satelliteInfo.address} />
                  </div>
                </div>
              </div>
              <div className="grid-item space">
                <div className="name">Free MVK Space</div>
                <div className="value">
                  <CommaNumber
                    value={Math.max(
                      satelliteInfo.sMvkBalance * satelliteInfo.delegationRatio - satelliteInfo.totalDelegatedAmount,
                      0,
                    )}
                  />
                </div>
              </div>
              <div className="grid-item participation">
                <div className="name">Gov. Participation</div>
                <div className="value">
                  <CommaNumber value={satelliteMetrics.proposalParticipation} endingText="%" />
                </div>
              </div>
              <div className="grid-item delegated">
                <div className="name">Delegated MVK</div>
                <div className="value">
                  <CommaNumber value={satelliteInfo.totalDelegatedAmount + satelliteInfo.sMvkBalance} />
                </div>
              </div>
              <div className="grid-item fee">
                <div className="name">Fee</div>
                <div className="value">
                  <CommaNumber value={satelliteInfo.satelliteFee} endingText="%" />
                </div>
              </div>
              <div className="grid-item oraclePart">
                <div className="name">Oracle Participation</div>
                <div className="value">
                  <CommaNumber value={satelliteMetrics.oracleEfficiency} endingText="%" />
                </div>
              </div>
            </div>
            <Link to="#">Satellites Overview</Link>
          </>
        ) : (
          <div className="no-data">
            <span>You are not delegated at this time.</span>
            <Link to="/yield-farms">
              <Button
                text="Satellites"
                icon="satellite"
                kind={ACTION_PRIMARY}
                className="noStroke dashboard-sectionLink"
              />
            </Link>
          </div>
        )}
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

export default DelegationTab
