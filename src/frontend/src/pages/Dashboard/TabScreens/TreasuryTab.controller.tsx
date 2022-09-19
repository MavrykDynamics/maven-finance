import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { SimpleTable } from 'app/App.components/SimpleTable/SimpleTable.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import { reduceTreasuryAssets } from 'pages/Treasury/Treasury.helpers'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { State } from 'reducers'
import { TreasuryBalanceType } from 'utils/TypesAndInterfaces/Treasury'
import { BlockName, StatBlock } from '../Dashboard.style'
import { TabWrapperStyled, TreasuryContentStyled, TreasuryVesting } from './DashboardTabs.style'

export const columnNames = ['Asset', 'Amount', 'USD Value']
export const fieldsMapper = [
  {
    fieldName: 'symbol',
  },
  {
    fieldName: 'balance',
    needCommaNumber: true,
  },
  {
    fieldName: 'usdValue',
    callback: (fieldName: string, value: unknown) => {
      const { rate, symbol, usdValue } = value as TreasuryBalanceType
      const obj = {
        ...(rate ? { beginningText: '$' } : { endingText: symbol }),
      }
      return <CommaNumber {...obj} value={Number(usdValue)} />
    },
  },
]

export const TreasuryTab = () => {
  const { treasuryStorage } = useSelector((state: State) => state.treasury)
  const {
    vestingStorage: { totalVestedAmount, totalClaimedAmount },
  } = useSelector((state: State) => state.vesting)

  const amountOfTokens = totalVestedAmount + totalClaimedAmount

  const { assetsBalances, globalTreasuryTVL } = useMemo(() => reduceTreasuryAssets(treasuryStorage), [treasuryStorage])

  return (
    <TabWrapperStyled backgroundImage="dashboard_treasuryTab_bg.png">
      <div className="top">
        <BGTitle>Treasury</BGTitle>
        <Link to="/treasury">
          <Button text="Treasury" icon="treasury" kind={ACTION_PRIMARY} className="noStroke" />
        </Link>
      </div>

      <TreasuryContentStyled>
        <div className="top">
          <StatBlock>
            <div className="name">Global Treasury</div>
            <div className="value">
              <CommaNumber endingText="USD" value={globalTreasuryTVL} />
            </div>
          </StatBlock>
          <StatBlock>
            <div className="name">Development Treasury</div>
            <div className="value">
              <CommaNumber endingText="USD" value={124141} />
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
              className="dashboard-st"
            />
          </div>
          <div>
            <BlockName>Token Vesting</BlockName>

            <TreasuryVesting
              totalPersent={(totalVestedAmount / amountOfTokens || 0.5) * 100}
              claimedColor={'navTitleColor'}
              totalColor={'primaryColor'}
            >
              <div className="vest-stat">
                <div className="name">
                  <div className="color claimed" /> Tokens Claimed
                </div>
                <div className="value">
                  <CommaNumber value={totalClaimedAmount} endingText="MVK" />
                </div>
              </div>

              <div className="vest-stat">
                <div className="name">
                  <div className="color total" /> Total Vested
                </div>
                <div className="value">
                  <CommaNumber value={totalVestedAmount} endingText="MVK" />
                </div>
              </div>

              <div className="ratio">
                <div className="claimed">
                  <div className="hoverValue">
                    Claimed tokens persent: {(totalClaimedAmount / amountOfTokens || 0.5) * 100}%
                  </div>
                </div>
                <div className="total">
                  <div className="hoverValue">
                    Total vested persent: {(totalVestedAmount / amountOfTokens || 0.5) * 100}%
                  </div>
                </div>
              </div>
            </TreasuryVesting>
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
