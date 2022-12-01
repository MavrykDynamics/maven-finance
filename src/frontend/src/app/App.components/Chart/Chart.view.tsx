import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, BusinessDay, UTCTimestamp } from 'lightweight-charts'

// styles
import { ChartStyled, Plug, TradingViewTooltipStyled } from './Chart.style'

// helpers
import { parseDate } from '../../../utils/time'

// components
import Icon from '../Icon/Icon.view'

import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { headerColor, lightTextColor, skyColor } from 'styles'

type TradingViewChartProps = {
  data: { time: UTCTimestamp; value: number }[]
  colors?: {
    lineColor?: string
    areaTopColor?: string
    areaBottomColor?: string
    textColor?: string
    borderColor?: string
  }
  settings: {
    height: number
    tickDateFormatter?: (date: number) => string
    tickPriceFormatter?: (value: number) => string
    dateTooltipFormatter?: (date: number) => string
    valueTooltipFormatter?: (date: number) => string
  }
  className?: string
}

type TooltipPropsType = {
  mvkAmount?: number
  date?: string | number
}

const TradingViewTooltip = ({ mvkAmount, date }: TooltipPropsType) => {
  if (!mvkAmount || !date) {
    return null
  }

  return (
    <TradingViewTooltipStyled>
      <div className="value">
        <CommaNumber endingText="MVK" value={mvkAmount} />
      </div>
      <div className="date">{date}</div>
    </TradingViewTooltipStyled>
  )
}

export const Chart = ({
  data,
  colors,
  settings,
  numberOfItemsToDisplay = 15,
  className,
}: TradingViewChartProps & { numberOfItemsToDisplay?: number }) => {
  if (data.length < numberOfItemsToDisplay) {
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

  return <TradingViewChart data={data} settings={settings} colors={colors} className={className} />
}

export const TradingViewChart = ({
  data,
  colors: {
    lineColor = skyColor,
    areaTopColor = skyColor,
    areaBottomColor = 'transparent',
    textColor = lightTextColor,
    borderColor = headerColor,
  } = {},
  settings: { height, dateTooltipFormatter, valueTooltipFormatter, tickPriceFormatter, tickDateFormatter },
  className,
}: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const mainChartWrapperRef = useRef<HTMLDivElement | null>(null)
  const [tooltipValue, setTooltipValue] = useState<TooltipPropsType>({
    mvkAmount: data.at(-1)?.value,
    date: data.at(-1)?.time,
  })

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
      localization: {
        locale: 'en-US',
        timeFormatter: (time: BusinessDay | UTCTimestamp) => {
          return tickDateFormatter?.(Number(time)) ?? parseDate({ time: Number(time), timeFormat: 'HH:mm' }) ?? ''
        },
      },
    })

    // Setting the border color for the vertical axis
    chart.priceScale().applyOptions({
      //TODO: add price formatter
      borderColor,
    })

    // Setting the border color for the horizontal axis
    chart.timeScale().applyOptions({
      borderColor,
      visible: true,
      tickMarkFormatter: (time: UTCTimestamp | BusinessDay) => {
        return tickDateFormatter?.(Number(time)) ?? parseDate({ time: Number(time), timeFormat: 'HH:mm' }) ?? ''
      },
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
        if (mainChartWrapperRef.current) {
          mainChartWrapperRef.current.style.setProperty('--translateX', '0')
          mainChartWrapperRef.current.style.setProperty('--translateY', '0')
        }
      } else {
        // set tooltip values
        setTooltipValue({
          ...tooltipValue,
          date:
            dateTooltipFormatter?.(Number(param.time)) ??
            parseDate({ time: Number(param.time), timeFormat: 'MMM DD, HH:mm Z' }) ??
            '',
          mvkAmount: Number(param.seriesPrices.get(series)),
        })
        if (mainChartWrapperRef.current) {
          mainChartWrapperRef.current.style.setProperty('--translateX', `${param.point.x + 15}`)
          mainChartWrapperRef.current.style.setProperty('--translateY', `${param.point.y - 20}`)
        }
      }
    })

    window.addEventListener('resize', handleResize)
    chart.timeScale().fitContent()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  return (
    <ChartStyled className={className} ref={mainChartWrapperRef}>
      <div ref={chartContainerRef} />
      <TradingViewTooltip mvkAmount={tooltipValue?.mvkAmount} date={tooltipValue?.date} />
    </ChartStyled>
  )
}
