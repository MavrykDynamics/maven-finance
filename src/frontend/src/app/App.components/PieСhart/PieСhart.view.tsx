import { useState } from 'react'
import { PieChart } from 'react-minimal-pie-chart'

// style
import { PieChartWrap } from './PieChart.style'

const segmentsStyle = { transition: 'stroke .3s', cursor: 'pointer' }
export default function PieChartView({ chartData }: { chartData: any }) {
  const [selected, setSelected] = useState<undefined | number>(1)
  const [focused, setFocused] = useState<undefined | number>(undefined)

  return (
    <PieChartWrap>
      <PieChart
        radius={40}
        lineWidth={30}
        segmentsTabIndex={1}
        label={(labelProps) => labelProps.dataEntry.percentage.toFixed(2) + '%'}
        labelPosition={100 - 30 / 2}
        labelStyle={() => ({
          fontSize: '6px',
          fontFamily: 'sans-serif',
          fill: '#fff',
        })}
        segmentsStyle={(index) => ({
          ...segmentsStyle,
          strokeWidth: chartData[index].segmentStroke,
        })}
        data={chartData}
        onClick={() => console.log('click event')}
      />
    </PieChartWrap>
  )
}
