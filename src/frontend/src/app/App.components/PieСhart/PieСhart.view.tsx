import { PieChart } from 'react-minimal-pie-chart'
import { SECTOR_STYLES } from './pieChart.const'
import { PieChartWrap } from './PieChart.style'

export default function PieChartView({ chartData }: { chartData: any }) {
  return (
    <PieChartWrap>
      <PieChart
        radius={40}
        paddingAngle={2}
        lineWidth={30}
        segmentsTabIndex={1}
        label={(labelProps) => labelProps.dataEntry.labelPersent.toFixed(2) + '%'}
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
