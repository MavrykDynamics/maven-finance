import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import themeColors from 'styles/colors'
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts'

// styles
import { ChartTooltip } from './Chart.style'

// helpers
import { parseDate } from '../../../utils/time'

type ChartStyle = {
  color?: string
  width?: number
  height?: number
  fontSize?: number
  tickMargin?: number
  paddingTop?: number
  paddingBottom?: number
  paddingRight?: number
  paddingLeft?: number
}

type ChartItem = {
  xAxis: string
  yAxis: number
}

type Props = {
  list: ChartItem[]
  style?: ChartStyle
  tickFormater?: (value: any, index: number) => string
  tooltipValueFormatter?: (value: string | number) => string
  className?: string
}

type ChartData = {
  uv: number
  pv: string
  time: string
}[]

type TooltipContent = Pick<{ label?: string }, 'label'>

const initialChartStyle: ChartStyle = {
  color: '#8D86EB',
  width: 655,
  height: 345,
  fontSize: 12,
  tickMargin: 11,
  paddingTop: 17,
  paddingBottom: 0,
  paddingRight: 0,
  paddingLeft: 22,
}

const timeFormat = 'HH:mm'
const getTime = (time: string) => parseDate({ time, timeFormat }) || ''

const dateFormat = 'MMM DD, HH:mm Z'
const getParsedDate = (time: string) => parseDate({ time, timeFormat: dateFormat }) || ''

export default function Chart({ list, style, tickFormater, tooltipValueFormatter, className }: Props) {
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const [chartStyle, setChartStyle] = useState(initialChartStyle)

  const renderTooltipContent = (o: TooltipContent, data: ChartData) => {
    const { label } = o
    const value = data.find((item) => item.time === label)?.uv || ''
    const date = data.find((item) => item.time === label)?.pv || ''
  
    return (
      <ChartTooltip>
        {tooltipValueFormatter ? tooltipValueFormatter(value) : value}
        <div>{date}</div>
      </ChartTooltip>
    )
  }

  const data = list?.length
    ? list.map(({ yAxis, xAxis }) => {
        return {
          uv: yAxis,
          pv: getParsedDate(xAxis),
          time: getTime(xAxis),
        }
      })
    : []

  useEffect(() => {
    if (style) {
      const updatedStyle = {
        ...initialChartStyle, 
        ...style,
      }

      setChartStyle(updatedStyle)
    }
  }, [style])

  return (
    <AreaChart className={className} width={chartStyle.width} height={chartStyle.height} data={data}>
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="10%" stopColor={themeColors[themeSelected].chartLinerGradientPrimary} stopOpacity={1} />
          <stop offset="100%" stopColor={themeColors[themeSelected].chartLinerGradientSecondary} stopOpacity={1} />
        </linearGradient>
      </defs>

      <XAxis
        tickLine={false}
        tick={{ fill: chartStyle.color }}
        stroke={chartStyle.color}
        padding={{ left: chartStyle.paddingLeft }}
        tickMargin={chartStyle.tickMargin}
        fontSize={chartStyle.fontSize}
        dataKey="time"
        allowDuplicatedCategory={false}
      />

      <YAxis
        tickLine={false}
        tick={{ fill: chartStyle.color }}
        stroke={chartStyle.color}
        padding={{ top: chartStyle.paddingTop }}
        tickMargin={chartStyle.tickMargin}
        fontSize={chartStyle.fontSize}
        orientation="right"
        tickFormatter={tickFormater}
      />

      <Tooltip cursor={{ stroke: themeColors[themeSelected].cardBorderColor, strokeWidth: 3 }} content={(o) => renderTooltipContent(o, data)} />
      <Area type="linear" dataKey="uv" stroke="transparent" fill="url(#colorUv)" />
    </AreaChart>
  )
}
