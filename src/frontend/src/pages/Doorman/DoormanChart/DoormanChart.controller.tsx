import React, { FC, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// styles
import { ChartCard, ChartSlidingTabButtons } from './DoormanChart.style'

// components
import Chart from '../../../app/App.components/Chart/Chart.view'
import { SlidingTabButtons, TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

const tabsList: TabItem[] = [
  {
    text: 'MVK Total Supply',
    id: 1,
    active: true,
  },
  {
    text: 'Staking History',
    id: 2,
    active: false,
  }
]

export const DoormanChart: FC = () => {
  const { stakeHistoryData } = useSelector((state: State) => state.doorman)

  const [activeTab, setActiveTab] = useState('')

  const chartList = useMemo(() => stakeHistoryData.map((item) => {
    return {
      ...item,
      finalAmount: item.finalAmount/10**9
    }
  }), [stakeHistoryData])

  const handleChangeTabs = (tabId?: number) => {
    setActiveTab( tabId === 1 ? 'MVK Total Supply' : 'Staking History')
  }
  
  return (
    <ChartCard>
      <ChartSlidingTabButtons>
        {tabsList?.length ? <SlidingTabButtons tabItems={tabsList} onClick={handleChangeTabs} /> : null}
      </ChartSlidingTabButtons>

      <Chart list={chartList} />
    </ChartCard>
  )
}
