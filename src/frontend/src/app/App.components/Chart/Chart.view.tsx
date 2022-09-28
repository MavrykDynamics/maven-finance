import React from 'react'
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts'

// styles
import { ChartStyled, ChartHeader, ChartTooltip } from './Chart.style'

type ChartItem = {
  timestamp: string
  finalAmount: number
  type: number
}

type Props = {
  list: ChartItem[]
  header: string
}

type ChartData = {
  uv: number
  pv: string
}[]

type TooltipContent = Pick<{ label?: number }, 'label'>

const renderTooltipContent = (o: TooltipContent, data: ChartData) => {
  const label = o.label ?? 0
  const value = Object.values(data)[label]?.uv || ''
  const date = Object.values(data)[label]?.pv || ''

  return (
    <ChartTooltip>
      {value} MVK
      <div>{date}</div>
    </ChartTooltip>
  )
}

const chartStyle = {
  width: 675,
  height: 292,
  padding: {
    top: 17,
    right: 0,
    left: 22,
    bottom: 0,
  },
  color: '#8D86EB',
}

export default function Chart(props: Props) {
  const { list, header } = props

  const data = list?.length
    ? list.map(({ finalAmount, timestamp }) => {
        return {
          uv: finalAmount,
          pv: timestamp,
        }
      })
    : []

  return (
    <ChartStyled>
      <ChartHeader>{header}</ChartHeader>
      <AreaChart
        width={chartStyle.width}
        height={chartStyle.height}
        data={data}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor="rgba(174, 237, 225, 1)" stopOpacity={1} />
            <stop offset="100%" stopColor="rgba(22, 14, 63, 1)" stopOpacity={1} />
          </linearGradient>
        </defs>

        <XAxis tick={{ fill: chartStyle.color }} stroke={chartStyle.color} type="category" padding={{left: chartStyle.padding.left}} />
        <YAxis tick={{ fill: chartStyle.color }} stroke={chartStyle.color} orientation='right' padding={{top: chartStyle.padding.top}} />

        <Tooltip cursor={{ stroke: '#503EAA', strokeWidth: 3 }} content={(o) => renderTooltipContent(o, data)} />
        <Area type="linear" dataKey="uv" stroke="transparent" fill="url(#colorUv)" />
      </AreaChart>
    </ChartStyled>
  )
}
