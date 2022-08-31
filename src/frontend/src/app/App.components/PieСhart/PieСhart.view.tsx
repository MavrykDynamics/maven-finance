import { PieChart } from 'react-minimal-pie-chart'
import { SECTOR_STYLES } from './pieChart.const'
import { PieChartWrap } from './PieChart.style'

// @ts-ignore
export default function PieChartView({ chartData }: { chartData }) {
  return (
    <PieChartWrap>
      <PieChart
        radius={40}
        paddingAngle={0}
        lineWidth={30}
        segmentsTabIndex={1}
        label={(labelProps) => {
          const labelPersent = labelProps.dataEntry.labelPersent
          const shownPersent =
            labelPersent !== undefined
              ? labelPersent.toFixed(2) < 1
                ? '< 1%'
                : `${parseFloat(labelPersent.toFixed(2))}%`
              : ''
          return shownPersent
        }}
        labelPosition={100 - 30 / 2}
        labelStyle={() => ({
          fontSize: '6px',
          fontFamily: 'sans-serif',
          fill: '#fff',
        })}
        segmentsStyle={(index) => ({
          ...SECTOR_STYLES,
          strokeWidth: chartData[index].segmentStroke,
        })}
        data={chartData}
      />
    </PieChartWrap>
  )
}
