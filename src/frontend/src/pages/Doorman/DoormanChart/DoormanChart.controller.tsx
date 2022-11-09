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
  const { mvkMintHistoryData, smvkHistoryData } = useSelector((state: State) => state.doorman)

  const [activeTab, setActiveTab] = useState(tabsList[0].text)
  const isStakingHistory = activeTab === tabsList[1].text

  const handleChangeTabs = (tabId?: number) => {
    setActiveTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }

  const valueFormatter = (label: string) => (value: number): string => `${formatNumber(true, value)}${label}`

  const shownData = isStakingHistory ? smvkHistoryData : mvkMintHistoryData

  return (
    <ChartCard className={className}>
      {tabsList?.length ? <ChartSlidingTabButtons tabItems={tabsList} onClick={handleChangeTabs} /> : null}

      <Chart style={{ height: 290 }} tooltipValueFormatter={valueFormatter(' MVK')} tickFormater={valueFormatter('')} list={shownData} />
    </ChartCard>
  )
}
