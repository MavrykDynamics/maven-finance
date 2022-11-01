import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// styles
import { ChartCard, ChartSlidingTabButtons } from './DoormanChart.style'

// components
import Chart from '../../../app/App.components/Chart/Chart.view'
import { TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

type Props = {
  className?: string
}

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
  },
]

export function DoormanChart({ className }: Props) {
  const { stakeHistoryData, smvkHistoryData } = useSelector((state: State) => state.doorman)

  const [activeTab, setActiveTab] = useState(tabsList[0].text)
  const isStakingHistory = activeTab === tabsList[1].text

  const handleChangeTabs = (tabId?: number) => {
    setActiveTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }

  const tooltipValueFormatter = (value: number): string => `${formatNumber(true, value)} MVK`

  const shownData = isStakingHistory ? stakeHistoryData : smvkHistoryData

  // TODO: decide what to show it no enought data
  // if (!shownData.length) return null

  return (
    <ChartCard className={className}>
      {tabsList?.length ? <ChartSlidingTabButtons tabItems={tabsList} onClick={handleChangeTabs} /> : null}

      <Chart tooltipValueFormatter={tooltipValueFormatter} list={shownData} />
    </ChartCard>
  )
}
