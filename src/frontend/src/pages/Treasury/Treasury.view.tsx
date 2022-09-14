import React, { useState, useMemo } from 'react'

// view
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import PieChartView from '../../app/App.components/PieСhart/PieСhart.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

import { calcPersent } from './helpers/treasury.utils'

// style
import { TreasuryViewStyle } from './Treasury.style'
import { getPieChartData } from './helpers/calculateChartData'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'

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
        treasury.balances
          .reduce((acc, treasuryBalanceObj) => {
            acc += treasuryBalanceObj.balance * treasuryBalanceObj.rate
            return acc
          }, 0)
          .toFixed(3),
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
          {isGlobal ? (
            <var>
              <CommaNumber beginningText="$" value={reducedBalance} />
            </var>
          ) : null}
        </header>
        {factoryAddress ? (
          <div className="factory_address">
            <div className="text">Treasury Factory address</div>{' '}
            <TzAddress type={CYAN} tzAddress={factoryAddress} hasIcon />
          </div>
        ) : null}
        <div>
          {!isGlobal ? (
            <div className="assets-block assets-block-tvl">
              <p className="asset-name">TVL</p>
              <p className="asset-value">
                <CommaNumber beginningText="$" value={reducedBalance} />
              </p>
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
                    <CommaNumber value={balanceValue.balance} />
                  </p>
                  <p className="asset-value right-text value">
                    <CommaNumber beginningText="$" value={balanceValue.balance * balanceValue.rate} />
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
            const balanceSum = Number((balanceValue.balance * balanceValue.rate).toFixed(5))

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
