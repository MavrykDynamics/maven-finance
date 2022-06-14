import React, { useState } from 'react'

// view
import { TreasuryChartType, TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import PieChartView from '../../app/App.components/PieСhart/PieСhart.view'

import { calcPersent, getAssetColor } from './helpers/treasury.utils'
import { TREASURY_ASSSET_BALANCE_DIVIDER, TREASURY_NUMBER_FORMATTER } from './treasury.const'
import { HIGHLIGHTED_STROKE_WIDTH, DEFAULT_STROKE_WIDTH } from 'app/App.components/PieСhart/pieChart.const'

// style
import { TreasuryViewStyle } from './Treasury.style'

type Props = {
  treasury: TreasuryType
  isGlobal?: boolean
}

export default function TreasuryView({ treasury, isGlobal = false }: Props) {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)

  const reducedBalance = Number(
    (
      treasury.balances.reduce((acc, treasuryBalanceObj) => {
        acc += treasuryBalanceObj.balance
        return acc
      }, 0) * TREASURY_ASSSET_BALANCE_DIVIDER
    ).toFixed(3),
  )

  // need this flag to properly calculate segment value and highlight segment
  let groupedSectorsValue = 0
  let groupedSectorsColor = null

  const chartData = treasury.balances.reduce<TreasuryChartType>((acc, item, idx) => {
    const tokenPersent = calcPersent(item.balance, reducedBalance)

    if (tokenPersent < 10) {
      const smallValuesAccIdx = acc.findIndex((item) => item.groupedSmall)
      const smallValuesAccObj = acc?.[smallValuesAccIdx]

      // calculating hover effect on segment
      const isHoveredPathAsset =
        hoveredPath &&
        treasury.balances.find(
          (item) =>
            hoveredPath === item.symbol &&
            calcPersent(item.balance * TREASURY_ASSSET_BALANCE_DIVIDER, reducedBalance) < 10,
        )

      // if we don't have grouped assets object, create it
      if (!smallValuesAccObj) {
        groupedSectorsValue += item.balance * TREASURY_ASSSET_BALANCE_DIVIDER
        groupedSectorsColor = getAssetColor(idx)
        acc.push({
          title: item.symbol,
          value: isHoveredPathAsset ? (reducedBalance / 100) * 20 : groupedSectorsValue + (reducedBalance / 100) * 1.5,
          color: groupedSectorsColor,
          segmentStroke: isHoveredPathAsset ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
          labelPersent: calcPersent(item.balance * TREASURY_ASSSET_BALANCE_DIVIDER, reducedBalance),
          groupedSmall: true,
        })

        return acc
      } else {
        // if we have grouped assets object and we have one more asset < 10%, just update it's title and balance in the acc
        groupedSectorsValue += item.balance * TREASURY_ASSSET_BALANCE_DIVIDER

        const newSmallValuesObj = {
          ...smallValuesAccObj,
          title: `${smallValuesAccObj.title}, ${item.symbol}`,
          value: isHoveredPathAsset ? (reducedBalance / 100) * 20 : groupedSectorsValue + (reducedBalance / 100) * 1.5,
          labelPersent: calcPersent(groupedSectorsValue, reducedBalance),
          segmentStroke: isHoveredPathAsset ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
        }

        acc.splice(smallValuesAccIdx, 1, newSmallValuesObj)
        return acc
      }
    }

    // if asset is > 10%
    acc.push({
      title: item.symbol,
      value: item.balance * TREASURY_ASSSET_BALANCE_DIVIDER,
      color: getAssetColor(idx),
      segmentStroke: hoveredPath === item.symbol ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
      labelPersent: calcPersent(item.balance * TREASURY_ASSSET_BALANCE_DIVIDER, reducedBalance),
      groupedSmall: false,
    })
    return acc
  }, [])

  return (
    <TreasuryViewStyle>
      <div>
        <header>
          <h1>{treasury.name}</h1>
          {isGlobal ? <var>$ {TREASURY_NUMBER_FORMATTER.format(reducedBalance)}</var> : null}
        </header>
        <div>
          {!isGlobal ? (
            <div className="assets-block assets-block-tvl">
              <p className="asset-name">TVL</p>
              <p className="asset-value">$ {TREASURY_NUMBER_FORMATTER.format(reducedBalance)}</p>
              <div />
            </div>
          ) : null}
          {treasury?.balances?.length ? (
            <>
              <div className="assets-block">
                <h5>Asset</h5>
                <h5>Amount</h5>
                <h5 className="right-text">USD Value</h5>
              </div>
              <div
                style={{ paddingRight: treasury?.balances?.length > 4 ? 16 : 0 }}
                className="assets-map scroll-block"
              >
                {treasury.balances.map((balanceValue) => {
                  return (
                    <div className="assets-block assets-block-map" key={balanceValue.contract}>
                      <p className="asset-name">{balanceValue.symbol}</p>
                      <p className="asset-value">
                        {TREASURY_NUMBER_FORMATTER.format(Number(balanceValue.balance.toFixed(3)))}
                      </p>
                      <p className="asset-value right-text">
                        {TREASURY_NUMBER_FORMATTER.format(
                          Number((balanceValue.balance * TREASURY_ASSSET_BALANCE_DIVIDER).toFixed(3)),
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div>{chartData.length ? <PieChartView chartData={chartData} /> : null}</div>
      <div>
        <div className="asset-lables scroll-block">
          {treasury?.balances?.length
            ? treasury.balances.map((balanceValue, idx) => {
                const balanceSum = Number((balanceValue.balance * TREASURY_ASSSET_BALANCE_DIVIDER).toFixed(5))

                return (
                  <div
                    style={{
                      background: `linear-gradient(90deg,${
                        chartData.find(({ title }) => title === balanceValue.symbol)?.color
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
                      {balanceValue.symbol}{' '}
                      <span className="asset-persent">{calcPersent(balanceSum, reducedBalance).toFixed(3)}%</span>
                    </p>
                  </div>
                )
              })
            : null}
        </div>
      </div>
    </TreasuryViewStyle>
  )
}
