import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AreaChart, Area, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { createChart, ColorType } from 'lightweight-charts'

// styles
import { ChartStyled, ChartTooltip, Plug, TradingViewTooltipStyled } from './Chart.style'

// helpers
import { parseDate } from '../../../utils/time'

// components
import Icon from '../Icon/Icon.view'

import { State } from 'reducers'

import themeColors from 'styles/colors'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { useDebounce } from 'react-use'

type ChartStyle = {
  color?: string
  width?: number | string
  height?: number | string
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
  tooltipValueFormatter?: (value: number) => string
  numberOfItemsToDisplay?: number
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

const renderTooltipContent = (
  o: TooltipContent,
  data: ChartData,
  tooltipValueFormatter?: (value: number) => string,
) => {
  const { label } = o
  const { uv: value = 0, pv: date = '' } = data.find((item) => item.time === label) ?? {}

  return (
    <ChartTooltip>
      {tooltipValueFormatter ? tooltipValueFormatter(value) : value}
      <div>{date}</div>
    </ChartTooltip>
  )
}

const timeFormat = 'HH:mm'
const getTime = (time: string) => parseDate({ time, timeFormat }) || ''

const dateFormat = 'MMM DD, HH:mm Z'
const getParsedDate = (time: string) => parseDate({ time, timeFormat: dateFormat }) || ''

export default function Chart({
  list,
  style,
  tickFormater,
  tooltipValueFormatter,
  numberOfItemsToDisplay = 15,
  className,
}: Props) {
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const [chartStyle, setChartStyle] = useState(initialChartStyle)

  // this is necessary to ensure that a large number of figures are not cut
  const maxValue = list.length ? list.reduce((acc, curr) => (acc.yAxis > curr.yAxis ? acc : curr)).yAxis : 0
  const maxValueLength = String(maxValue).length
  const marginRight = maxValueLength > 5 ? maxValueLength * 4.5 : 5

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

  if (list.length < numberOfItemsToDisplay) {
    return (
      <Plug>
        <div>
          <Icon id="stars" className="icon-stars" />
          <Icon id="cow" className="icon-cow" />
        </div>

        <p>There is not enough data to display the graph</p>
      </Plug>
    )
  }

  return (
    <ResponsiveContainer width={chartStyle.width} height={chartStyle.height}>
      <AreaChart className={className} data={data} margin={{ right: marginRight }}>
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

        <Tooltip
          cursor={{ stroke: themeColors[themeSelected].cardBorderColor, strokeWidth: 3 }}
          content={(o) => renderTooltipContent(o, data, tooltipValueFormatter)}
        />
        <Area type="linear" dataKey="uv" stroke="transparent" fill="url(#colorUv)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

type TradingViewChartProps = {
  data: { time: string; value: number }[]
  colors: { lineColor: string; areaTopColor: string; areaBottomColor: string; textColor: string }
  settings: { height: number }
  className?: string
}

type TooltipPropsType = {
  mvkAmount?: number
  date?: string | number
  x?: number
  y?: number
}

const TradingViewTooltip = ({ mvkAmount, date, y, x }: TooltipPropsType) => {
  if (!mvkAmount || !date) {
    return null
  }

  return (
    <TradingViewTooltipStyled x={x} y={y}>
      <div className="value">
        <CommaNumber endingText="MVK" value={mvkAmount} />
      </div>
      <div className="date">{parseDate({ time: date, timeFormat: dateFormat })}</div>
    </TradingViewTooltipStyled>
  )
}

export const TradingViewChart = ({
  data,
  colors: { lineColor, areaTopColor, areaBottomColor, textColor },
  settings: { height },
  className,
}: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const [tooltipValue, setTooltipValue] = useState<TooltipPropsType>({
    mvkAmount: data.at(-1)?.value,
    date: data.at(-1)?.time,
  })
  // const [debouncedTooltipValue, setDebounsedTooltipValue] = useState<TooltipPropsType | null>(null)

  // useDebounce(
  //   () => {
  //     setDebounsedTooltipValue(tooltipValue)
  //   },
  //   100,
  //   [tooltipValue],
  // )

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef?.current?.clientWidth ?? 0 })
    }

    const chart = createChart(chartContainerRef?.current ?? '', {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontSize: 12,
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      width: chartContainerRef?.current?.clientWidth ?? 0,
      height,
    })

    // Setting the border color for the vertical axis
    chart.priceScale().applyOptions({
      //TODO: add price formatter
      borderColor: '#8D86EB',
    })

    // Setting the border color for the horizontal axis
    chart.timeScale().applyOptions({
      // TODO: add time formatter
      borderColor: '#8D86EB',
      visible: true,
    })

    const series = chart.addAreaSeries({ lineColor, topColor: areaTopColor, bottomColor: areaBottomColor })

    series.setData(data)
    series.applyOptions({
      lastValueVisible: false,
      priceLineVisible: false,
    })

    chart.subscribeCrosshairMove((param) => {
      if (
        !chartContainerRef?.current ||
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef?.current?.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef?.current?.clientHeight
      ) {
        // hide tooltip
        setTooltipValue({
          ...tooltipValue,
          y: undefined,
          x: undefined,
        })
      } else {
        // set tooltip values
        setTooltipValue({
          ...tooltipValue,
          // TODO: add time handing
          date: Date.now(),
          mvkAmount: Number(param.seriesPrices.get(series)),
          y: param.point.y,
          x: param.point.x,
        })
      }
    })

    window.addEventListener('resize', handleResize)
    chart.timeScale().fitContent()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, lineColor, textColor, areaTopColor, areaBottomColor, height])

  return (
    <ChartStyled ref={chartContainerRef} className={className}>
      <TradingViewTooltip
        // mvkAmount={debouncedTooltipValue?.mvkAmount}
        mvkAmount={tooltipValue?.mvkAmount}
        // date={debouncedTooltipValue?.date}
        date={tooltipValue?.date}
        // x={debouncedTooltipValue?.x}
        x={tooltipValue?.x}
        // y={debouncedTooltipValue?.y}
        y={tooltipValue?.y}
      />
    </ChartStyled>
  )
}
