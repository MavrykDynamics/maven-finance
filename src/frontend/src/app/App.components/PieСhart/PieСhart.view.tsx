import { useState } from 'react'
import { PieChart } from 'react-minimal-pie-chart'

// style
import { PieChartWrap } from './PieChart.style'
import { tezosColor, royalPurpleColor, skyColor } from 'styles'

const defaultStroke = 15

const dataMock = [
  { title: 'One', value: 15, color: tezosColor, segmentStroke: 15 },
  { title: 'Two', value: 25, color: '#8DD8C7', segmentStroke: 19 },
  { title: 'Three', value: 40, color: royalPurpleColor, segmentStroke: 15 },
  { title: 'Three', value: 20, color: skyColor, segmentStroke: 19 },
]

const dataMockSameStrokeWidth = [
  { title: 'One', value: 15, color: tezosColor, segmentStroke: defaultStroke },
  { title: 'Two', value: 50, color: '#8DD8C7', segmentStroke: defaultStroke },
  { title: 'Three', value: 40, color: royalPurpleColor, segmentStroke: defaultStroke },
  { title: 'Three', value: 20, color: skyColor, segmentStroke: defaultStroke },
]

const segmentsStyle = { transition: 'stroke .3s', cursor: 'pointer' }
export default function PieChartView({
  differentStrokeWidth,
  chartData,
}: {
  differentStrokeWidth?: boolean
  chartData: any
}) {
  const [selected, setSelected] = useState<undefined | number>(1)
  const [focused, setFocused] = useState<undefined | number>(undefined)

  const dataToUse = differentStrokeWidth ? chartData : dataMock

  return (
    <PieChartWrap>
      <PieChart
        radius={40}
        lineWidth={30}
        segmentsTabIndex={1}
        label={(labelProps) => Math.round(labelProps.dataEntry.percentage) + '%'}
        labelPosition={100 - 30 / 2}
        labelStyle={() => ({
          fontSize: '6px',
          fontFamily: 'sans-serif',
          fill: '#fff',
        })}
        segmentsStyle={(index) => ({
          ...segmentsStyle,
          strokeWidth: dataToUse[index].segmentStroke,
        })}
        data={dataToUse}
        onClick={() => console.log('click event')}
      />
    </PieChartWrap>
  )
}
