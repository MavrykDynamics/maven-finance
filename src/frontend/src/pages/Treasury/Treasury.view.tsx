// view
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import PieChartView from '../../app/App.components/PieСhart/PieСhart.view'

// style
import { TreasuryViewStyle } from './Treasury.style'

type Props = {
  treasury: TreasuryType
  isGlobal?: boolean
}

const TREASURYS_COLORS = [
  '#0D61FF',
  '#5F95F2',
  '#FBB0B4',
  '#FF8486',
  '#38237C',
  '#503EAA',
  '#8D86EB',
  '#C0DBFF',
  '#55D8BA',
  '#8DD8C7',
]

const generateRandomColor = () => '#' + ('00000' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)).slice(-6)

export default function TreasuryView({ treasury, isGlobal = false }: Props) {
  const chartData = treasury.balances.map((item) => {
    return {
      title: item.symbol,
      value: item.balance, //item.balance < 10 ? 3000 : item.balance,
      color: generateRandomColor(),
      segmentStroke: 15,
    }
  })

  console.log('chartData', chartData)

  const reducedBalance = treasury.balances.reduce((acc, treasuryBalanceObj) => {
    acc += treasuryBalanceObj.balance
    return acc
  }, 0)

  const numberFormatter = new Intl.NumberFormat('en-IN')

  return (
    <TreasuryViewStyle>
      <div>
        <header>
          <h1>{treasury.name}</h1>
          {isGlobal ? <var>$ {numberFormatter.format(Number((reducedBalance * 0.25).toFixed(3)))}</var> : null}
        </header>
        <div>
          {!isGlobal ? (
            <div className="assets-block assets-block-tvl">
              <p className="asset-name">TVL</p>
              <p className="asset-value">$ {numberFormatter.format(Number((reducedBalance * 0.25).toFixed(3)))}</p>
              <div />
            </div>
          ) : null}
          <div className="assets-block">
            <h5>Asset</h5>
            <h5>Amount</h5>
            <h5 className="right-text">USD Value</h5>
          </div>
          <div style={{ paddingRight: treasury?.balances?.length > 4 ? 16 : 0 }} className="assets-map scroll-block">
            {treasury?.balances?.length
              ? treasury.balances.map((balanceValue) => {
                  return (
                    <div className="assets-block assets-block-map" key={balanceValue.contract}>
                      <p className="asset-name">{balanceValue.symbol}</p>
                      <p className="asset-value">{numberFormatter.format(Number(balanceValue.balance.toFixed(3)))}</p>
                      <p className="asset-value right-text">
                        $ {numberFormatter.format(Number((balanceValue.balance * 0.25).toFixed(3)))}
                      </p>
                    </div>
                  )
                })
              : null}
          </div>
        </div>
      </div>
      <div>
        <PieChartView chartData={chartData} />
      </div>
      <div>
        <div className="asset-lables scroll-block">
          {treasury?.balances?.length
            ? treasury.balances.map((balanceValue) => {
                return (
                  <div
                    style={{
                      background: `linear-gradient(90deg,${generateRandomColor()} 0%,rgba(255,255,255,0) 100%)`,
                    }}
                    className="asset-lable"
                    key={balanceValue.contract}
                  >
                    <p className="asset-lable-text">{balanceValue.symbol}</p>
                  </div>
                )
              })
            : null}
        </div>
      </div>
    </TreasuryViewStyle>
  )
}
