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
            <p>TVL</p>
            <p>$ 38,987,657.329</p>
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
                    <p>{item.asset}</p>
                    <p>{item.amount}</p>
                    <p className="right-text">$ {item.amount * 0.25}</p>
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
                  <p>{item.asset}</p>
                </div>
              )
            })
          : null}
      </div>
    </TreasuryViewStyle>
  )
}
