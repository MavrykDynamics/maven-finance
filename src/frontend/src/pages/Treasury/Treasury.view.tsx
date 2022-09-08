import React, { useState, useMemo } from 'react'

// view
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import PieChartView from '../../app/App.components/PieСhart/PieСhart.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

import { calcPersent } from './helpers/treasury.utils'
import { TREASURY_ASSSET_BALANCE_DIVIDER, TREASURY_NUMBER_FORMATTER } from './treasury.const'

// style
import { TreasuryViewStyle } from './Treasury.style'
import { getPieChartData } from './helpers/calculateChartData'

type Props = {
  treasury: TreasuryType
  isGlobal?: boolean
  factoryAddress?: string
}

export default function TreasuryView({ treasury, isGlobal = false, factoryAddress = '' }: Props) {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)

  const reducedBalance = useMemo(
    () =>
      Number(
        (
          treasury.balances.reduce((acc, treasuryBalanceObj) => {
            acc += treasuryBalanceObj.balance
            return acc
          }, 0) * TREASURY_ASSSET_BALANCE_DIVIDER
        ).toFixed(3),
      ),
    [treasury.balances],
  )

  const chartData = useMemo(() => {
    return getPieChartData(treasury.balances, reducedBalance, hoveredPath)
  }, [hoveredPath, reducedBalance, treasury.balances])

  return (
    <TreasuryViewStyle>
      <div className="content-wrapper">
        <header>
          {treasury.name ? <h1 title={treasury.name}>{treasury.name}</h1> : null}
          {isGlobal ? <var>$ {TREASURY_NUMBER_FORMATTER.format(reducedBalance)}</var> : null}
        </header>
        {factoryAddress ? (
          <div className="factory_address">
            <div className="text">Treasury Factory address</div>{' '}
            <TzAddress tzAddress={factoryAddress} hasIcon={false} />
          </div>
        ) : null}
        <div>
          {!isGlobal ? (
            <div className="assets-block assets-block-tvl">
              <p className="asset-name">TVL</p>
              <p className="asset-value">$ {TREASURY_NUMBER_FORMATTER.format(reducedBalance)}</p>
              <div />
            </div>
          ) : null}

          <div className="assets-block">
            <h5>Asset</h5>
            <h5>Amount</h5>
            <h5 className="right-text">USD Value</h5>
          </div>
          <div style={{ paddingRight: treasury?.balances?.length > 4 ? 16 : 0 }} className="assets-map scroll-block">
            {treasury.balances.map((balanceValue) => {
              return (
                <div className="assets-block assets-block-map" key={balanceValue.contract}>
                  <p className="asset-name">{balanceValue.symbol}</p>
                  <p className="asset-value">
                    {TREASURY_NUMBER_FORMATTER.format(Number(balanceValue.balance.toFixed(3)))}
                  </p>
                  <p className="asset-value right-text value">
                    $ {TREASURY_NUMBER_FORMATTER.format(Number((balanceValue.balance * balanceValue.rate).toFixed(3)))}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div>
        <PieChartView chartData={chartData} />
      </div>
      <div>
        <div className="asset-lables scroll-block">
          {treasury.balances.map((balanceValue) => {
            const balanceSum = Number((balanceValue.balance * TREASURY_ASSSET_BALANCE_DIVIDER).toFixed(5))

            return (
              <div
                style={{
                  background: `linear-gradient(90deg,${
                    chartData.find(({ title }) => title === balanceValue.symbol || title.includes(balanceValue.symbol))
                      ?.color
                  } 0%,rgba(255,255,255,0) 100%)`,
                }}
                className="asset-lable"
                onMouseEnter={() => {
                  setHoveredPath(balanceValue.symbol)
                }}
                onMouseLeave={() => setHoveredPath(null)}
                key={balanceValue.contract}
              >
                <p className="asset-lable-text">
                  {balanceValue.symbol}
                  <span className="asset-persent">{calcPersent(balanceSum, reducedBalance).toFixed(3)}%</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </TreasuryViewStyle>
  )
}
