import React, { FC, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import Chart from '../../../app/App.components/Chart/Chart.view'
import { SlidingTabButtons, TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// styles 
import { ChartCard, ChartSlidingTabButtons } from './DataFeedsChart.style'

// actions
import { getDataFeedsHistory } from '../../Satellites/Satellites.actions'

type Props = {
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

export const DataFeedsChart: FC<Props> = ({ className }) => {
  const dispatch = useDispatch()
  const { dataFeedsHistory } = useSelector((state: State) => state.oracles)
  console.log("🚀 ~ file: DataFeeds.controller.tsx ~ line 50 ~ DataFeeds ~ dataFeedsHistory", dataFeedsHistory)

  const [activeTab, setActiveTab] = useState(tabsList[0].text)
  const isHistory = activeTab === tabsList[0].text

  const handleChangeTabs = (tabId?: number) => {
    setActiveTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }

  useEffect(() => {
    dispatch(getDataFeedsHistory())
  }, [dispatch])

 return (
  <ChartCard className={className}>
    <ChartSlidingTabButtons>
      {tabsList?.length ? <SlidingTabButtons tabItems={tabsList} onClick={handleChangeTabs} /> : null}
    </ChartSlidingTabButtons>

    <Chart list={[]} />
  </ChartCard>
 )
}
