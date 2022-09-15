import { HIGHLIGHTED_STROKE_WIDTH, DEFAULT_STROKE_WIDTH } from 'app/App.components/PieСhart/pieChart.const'
import { TreasuryBalanceType, TreasuryChartType } from 'utils/TypesAndInterfaces/Treasury'
import { calcPersent, getAssetColor } from './treasury.utils'

export const getPieChartData = (
  balances: Array<TreasuryBalanceType>,
  reducedBalance: number,
  hoveredPath: string | null,
) => {
  // need this flag to properly calculate segment value and highlight segment
  let groupedSectorsValue = 0
  let groupedSectorsColor = null

  return balances.length
    ? balances.reduce<TreasuryChartType>((acc, item, idx) => {
        // TODO: need this while some assets are test, and i can't fetch their rate
        const tokenUsdValue = item.usdValue || 0
        const tokenPersent = calcPersent(tokenUsdValue, reducedBalance)

        if (tokenPersent < 10) {
          const smallValuesAccIdx = acc.findIndex((item) => item.groupedSmall)
          const smallValuesAccObj = acc?.[smallValuesAccIdx]

          // calculating hover effect on segment
          const isHoveredPathAsset =
            hoveredPath &&
            balances.find((item) => hoveredPath === item.symbol && calcPersent(tokenUsdValue, reducedBalance) < 10)

          // if we don't have grouped assets object, create it
          if (!smallValuesAccObj) {
            groupedSectorsValue += tokenUsdValue
            groupedSectorsColor = getAssetColor(idx)
            acc.push({
              title: item.symbol,
              value: isHoveredPathAsset
                ? (reducedBalance / 100) * 20
                : groupedSectorsValue + (reducedBalance / 100) * 1.5,
              color: groupedSectorsColor,
              segmentStroke: isHoveredPathAsset ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
              labelPersent: calcPersent(tokenUsdValue, reducedBalance),
              groupedSmall: true,
            })

            return acc
          } else {
            // if we have grouped assets object and we have one more asset < 10%, just update it's title and balance in the acc
            groupedSectorsValue += tokenUsdValue

            const newSmallValuesObj = {
              ...smallValuesAccObj,
              title: `${smallValuesAccObj.title}, ${item.symbol}`,
              value: isHoveredPathAsset
                ? (reducedBalance / 100) * 20
                : groupedSectorsValue + (reducedBalance / 100) * 1.5,
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
          value: tokenUsdValue,
          color: getAssetColor(idx),
          segmentStroke: hoveredPath === item.symbol ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
          labelPersent: calcPersent(tokenUsdValue, reducedBalance),
          groupedSmall: false,
        })
        return acc
      }, [])
    : [{ title: '', value: 1, color: '#ccc' }]
}
