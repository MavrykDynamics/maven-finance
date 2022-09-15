import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { SimpleTable } from 'app/App.components/SimpleTable/SimpleTable.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
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
    needCommaNumber: true,
    propsToComponents: {
      beginningText: '$',
    },
  },
]

export const TreasuryTab = () => {
  const { treasuryStorage } = useSelector((state: State) => state.treasury)

  const history = useHistory()

  const treasuryAssets = treasuryStorage.reduce((acc, { balances }) => {
    balances.forEach((balanceAsset) => {
      const currentAssetIndex = acc.findIndex((asset: TreasuryBalanceType) => asset.symbol === balanceAsset.symbol)
      if (currentAssetIndex < 0) {
        acc.push(balanceAsset)
      } else {
        acc[currentAssetIndex].balance += balanceAsset.balance
        acc[currentAssetIndex].usdValue = Number(acc[currentAssetIndex].usdValue) + 1
      }
    })

    return acc
  }, [] as Array<TreasuryBalanceType>)

  const globalTreasury = treasuryAssets.reduce((acc, asset) => acc + (asset.usdValue || 0), 0)

  return (
    <TabWrapperStyled backgroundImage="dashboard_treasuryTab_bg.png">
      <div className="top">
        <BGTitle>Treasury</BGTitle>
        <Button
          text="Treasury"
          icon="treasury"
          kind={ACTION_PRIMARY}
          className="noStroke"
          onClick={() => history.push('/treasury')}
        />
      </div>

      <TreasuryContentStyled>
        <div className="top">
          <StatBlock>
            <div className="name">Global Treasury</div>
            <div className="value">
              <CommaNumber endingText="USD" value={globalTreasury} />
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
              data={treasuryAssets}
              fieldsMapper={fieldsMapper}
              className="dashboard-st"
            />
          </div>
          <div>
            <BlockName>Token Vesting</BlockName>

            <TreasuryVesting totalPersent={20} claimedColor={'navTitleColor'} totalColor={'primaryColor'}>
              <div className="vest-stat">
                <div className="name">
                  <div className="color claimed" /> Tokens Claimed
                </div>
                <div className="value">
                  <CommaNumber value={42342342} endingText="MVK" />
                </div>
              </div>

              <div className="vest-stat">
                <div className="name">
                  <div className="color total" /> Total Vested
                </div>
                <div className="value">
                  <CommaNumber value={42342342} endingText="MVK" />
                </div>
              </div>

              <div className="ratio">
                <div className="claimed">
                  <div className="hoverValue">Claimed tokens persent: {100 - 20}%</div>
                </div>
                <div className="total">
                  <div className="hoverValue">Total vested persent: {20}%</div>
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
