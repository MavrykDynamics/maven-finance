import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// styles
import { ChartCard, Wrapper } from './DoormanChart.style'
import { TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

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
  const { mvkMintHistoryData: mvkMintHistoryDataBase, smvkHistoryData } = useSelector((state: State) => state.doorman)
  
  const getDefaultMvkMintHistoryData = useMemo(() => {
    var date = new Date();
    date.setDate(date.getDate() - 7);
    
    return [{
      xAxis: String(date),
      yAxis: 0,
    }]
  }, [])

  const mvkMintHistoryData = mvkMintHistoryDataBase.length ? mvkMintHistoryDataBase : getDefaultMvkMintHistoryData

  const [activeTab, setActiveTab] = useState(tabsList[0].text)
  const isStakingHistory = activeTab === tabsList[1].text

  const handleChangeTabs = (tabId?: number) => {
    setActiveTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }

  const valueFormatter = (label: string) => (value: number): string => `${formatNumber(true, value)}${label}`

  const shownData = isStakingHistory ? smvkHistoryData : mvkMintHistoryData

  return (
    <Wrapper>
       {tabsList?.length ? <TabSwitcher className='switcher' tabItems={tabsList} onClick={handleChangeTabs} /> : null}

      <ChartCard className={className}>
        <Chart
          style={{ height: 290 }}
          tooltipValueFormatter={valueFormatter(' MVK')}
          tickFormater={valueFormatter('')}
          list={shownData}
          numberOfItemsToDisplay={isStakingHistory ? undefined : 1}
        />
      </ChartCard>
    </Wrapper>
  )
}
