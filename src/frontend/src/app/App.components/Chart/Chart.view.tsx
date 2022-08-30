import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line } from 'recharts'

// style
import { ChartStyled, ChartHeader } from './Chart.style'

type Props = {
  list: number[]
  header: string
}

type ChartData = {
  uv: number
}[]

type TooltipContent = Pick<{ label?: number }, 'label'>

const renderTooltipContent = (o: TooltipContent, data: ChartData) => {
  const label = o.label ?? 0

  const value = Object.values(data)[label]?.uv || ''

  return <div className="tooltip">{value} MVK</div>
}

// TODO: refactor it and make it work, when data will be received

export default function Chart(props: Props) {
  const { list, header } = props

  // const data = list?.length
  //   ? list.map((uv) => {
  //       return {
  //         uv,
  //       }
  //     })
  //   : []

  return (
    <ChartStyled>
      <ChartHeader>{header}</ChartHeader>
      <aside>
        <b>Coming Soon</b>
      </aside>
      {/* <AreaChart
        width={573}
        height={280}
        data={data}
        margin={{
          top: 20,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor="rgba(174, 237, 225, 1)" stopOpacity={1} />
            <stop offset="100%" stopColor="rgba(22, 14, 63, 1)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <Tooltip cursor={{ stroke: '#503EAA', strokeWidth: 3 }} content={(o) => renderTooltipContent(o, data)} />       
        <Area type="linear" dataKey="uv" stroke="transparent" fill="url(#colorUv)" />
      </AreaChart> */}
    </ChartStyled>
  )
}
