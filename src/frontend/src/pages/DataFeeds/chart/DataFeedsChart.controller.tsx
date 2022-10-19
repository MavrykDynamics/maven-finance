import React, { FC, useState } from 'react'

// components
import Chart from '../../../app/App.components/Chart/Chart.view'
import { TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// styles 
import { ChartCard, ChartSlidingTabButtons } from './DataFeedsChart.style'

// types
import { DataFeedsHistory, DataFeedsVolatility } from '../../Satellites/helpers/Satellites.types'

type Props = {
  dataFeedsHistory: DataFeedsHistory
  dataFeedsVolatility: DataFeedsVolatility
  className?: string
}

const tabsList: TabItem[] = [
  {
    text: 'History',
    id: 1,
    active: true,
  },
  {
    text: 'Volatility',
    id: 2,
    active: false,
  },
]

export function DataFeedsChart({ className, dataFeedsHistory, dataFeedsVolatility }: Props) {
  const [activeTab, setActiveTab] = useState(tabsList[0].text)
  const isHistory = activeTab === tabsList[0].text

  const handleChangeTabs = (tabId?: number) => {
    setActiveTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }

  const tickFormater = (value: string | number): string =>  {
    return isHistory ? `$${value}` : `${value}%`
  }

 return (
  <ChartCard className={className}>
    {tabsList?.length ? <ChartSlidingTabButtons tabItems={tabsList} onClick={handleChangeTabs} /> : null}

    <Chart
      list={isHistory ? dataFeedsHistory : dataFeedsVolatility}
      style={{
        width: '100%',
        height: 300,
      }}
      tickFormater={tickFormater}
      tooltipValueFormatter={tickFormater}
    />
  </ChartCard>
 )
}
