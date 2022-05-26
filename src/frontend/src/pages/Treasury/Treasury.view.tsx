// view
import PieChartView from '../../app/App.components/PieСhart/PieСhart.view'

// style
import { TreasuryViewStyle } from './Treasury.style'

type Props = {
  treasury: any
}

export default function TreasuryView({ treasury }: Props) {
  return (
    <TreasuryViewStyle>
      <div>
        <header>
          <h1>Global Treasury TVL</h1>
          <var>$ 38,987,657.329</var>
        </header>
        <div>
          <div className="assets-block">
            <p className="asset-name">TVL</p>
            <p className="asset-value">$ 38,987,657.329</p>
            <div />
          </div>
          <div className="assets-block">
            <h5>Asset</h5>
            <h5>Amount</h5>
            <h5 className="right-text">USD Value</h5>
          </div>
          {treasury?.assets?.length
            ? treasury.assets.map((item: any) => {
                return (
                  <div className="assets-block" key={item.asset}>
                    <p className="asset-name">{item.asset}</p>
                    <p className="asset-value">{item.amount}</p>
                    <p className="asset-value right-text">$ {item.amount * 0.25}</p>
                  </div>
                )
              })
            : null}
        </div>
      </div>
      <div>
        <PieChartView />
      </div>
      <div>
        {treasury?.assets?.length
          ? treasury.assets.map((item: any) => {
              return (
                <div key={item.asset}>
                  <p className="asset-lable">{item.asset}</p>
                </div>
              )
            })
          : null}
      </div>
    </TreasuryViewStyle>
  )
}
