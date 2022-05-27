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
          {treasury.type === 'global' ? <var>$ 38,987,657.329</var> : null}
        </header>
        <div>
          {treasury.type !== 'global' ? (
            <div className="assets-block assets-block-tvl">
              <p className="asset-name">TVL</p>
              <p className="asset-value">$ 38,987,657.329</p>
              <div />
            </div>
          ) : null}
          <div className="assets-block">
            <h5>Asset</h5>
            <h5>Amount</h5>
            <h5 className="right-text">USD Value</h5>
          </div>
          {treasury?.assets?.length
            ? treasury.assets.map((item: any) => {
                return (
                  <div className="assets-block assets-block-map" key={item.asset}>
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
        <div className="asset-lables">
          {treasury?.assets?.length
            ? treasury.assets.map((item: any) => {
                return (
                  <div className="asset-lable" key={item.asset}>
                    <p className="asset-lable-text">{item.asset}</p>
                  </div>
                )
              })
            : null}
        </div>
      </div>
    </TreasuryViewStyle>
  )
}
