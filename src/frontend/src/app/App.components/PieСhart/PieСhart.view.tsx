import { useState } from 'react'
import { PieChart } from 'react-minimal-pie-chart'

// style
import { PieChartWrap } from './PieChart.style'
import { tezosColor, royalPurpleColor, skyColor } from 'styles'

const dataMock = [
  { title: 'One', value: 15, color: tezosColor, segmentStroke: 20 },
  { title: 'Two', value: 25, color: '#8DD8C7', segmentStroke: 25 },
  { title: 'Three', value: 40, color: royalPurpleColor, segmentStroke: null },
  { title: 'Three', value: 20, color: skyColor, segmentStroke: 25 },
  { title: 'Three', value: 20, color: skyColor, segmentStroke: 25 },
  { title: 'Three', value: 20, color: skyColor, segmentStroke: 25 },
  { title: 'Three', value: 20, color: skyColor, segmentStroke: 25 },
  { title: 'Three', value: 20, color: skyColor, segmentStroke: 25 },
]
const defaultStroke = 15
const segmentsStyle = { transition: 'stroke .3s', cursor: 'pointer' }
export default function PieChartView() {
  const [selected, setSelected] = useState<undefined | number>(1)
  const [focused, setFocused] = useState<undefined | number>(undefined)

  return (
    <PieChartWrap>
      <PieChart
        radius={50}
        lineWidth={30}
        segmentsTabIndex={1}
        label={(labelProps) => {
          return Math.round(labelProps.dataEntry.percentage) + '%'
        }}
        labelPosition={100 - 30 / 2}
        labelStyle={(labelIdx) => ({
          fontSize: '6px',
          fontFamily: 'sans-serif',
          fill: '#fff',
          display: 'flex',
          dominantBaseline: 'hanging',
          textAnchor: 'end',
          transform: `translateX(${(dataMock[labelIdx].segmentStroke || 25) - 20}px)`,
        })}
        segmentsStyle={(index) => ({
          ...segmentsStyle,
          strokeWidth: dataMock[index].segmentStroke || defaultStroke,
        })}
        data={dataMock}
      />
    </PieChartWrap>
  )
}
