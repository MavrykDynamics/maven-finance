import { useState } from 'react'
import { PieChart } from 'react-minimal-pie-chart'

// style
import { PieChartWrap } from './PieChart.style'
import { tezosColor, royalPurpleColor, skyColor } from 'styles'

const dataMock = [
  { title: 'One', value: 15, color: tezosColor },
  { title: 'Two', value: 10, color: '#8DD8C7' },
  { title: 'Three', value: 10, color: royalPurpleColor },
  { title: 'Three', value: 10, color: skyColor },
]
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
        segmentsStyle={(index) => {
          // return index === selected ? { ...segmentsStyle, strokeWidth: 32 } : segmentsStyle
          return { ...segmentsStyle, strokeWidth: index === 0 ? 25 : index === 1 ? 15 : index === 2 ? 25 : 15 }
        }}
        data={dataMock}
      />
    </PieChartWrap>
  )
}
