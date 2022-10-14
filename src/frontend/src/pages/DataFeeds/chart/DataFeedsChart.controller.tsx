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

  const [activeTab, setActiveTab] = useState(tabsList[0].text)
  const isHistory = activeTab === tabsList[0].text

  // TODO: test data
  const volatility = [
    {
      "xAxis": "2022-10-03T08:34:40+00:00",
      "yAxis": 29970
    },
    {
      "xAxis": "2022-10-03T14:20:00+00:00",
      "yAxis": 6000
    },
    {
      "xAxis": "2022-10-03T14:20:45+00:00",
      "yAxis": 10034
    },
    {
      "xAxis": "2022-10-03T14:20:45+00:00",
      "yAxis": 4323
    },
    {
      "xAxis": "2022-10-06T15:18:25+00:00",
      "yAxis": 10000
    },
    {
      "xAxis": "2022-10-07T07:50:50+00:00",
      "yAxis": 10005
    },
    {
      "xAxis": "2022-10-07T08:00:35+00:00",
      "yAxis": 30000
    },
    {
      "xAxis": "2022-10-07T08:03:10+00:00",
      "yAxis": 30000
    }
  ]

  const handleChangeTabs = (tabId?: number) => {
    setActiveTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }

  const tickFormater = (value: string | number): string =>  {
    return `$${value}`
  }

  useEffect(() => {
    dispatch(getDataFeedsHistory())
  }, [dispatch])

 return (
  <ChartCard className={className}>
    <ChartSlidingTabButtons>
      {tabsList?.length ? <SlidingTabButtons tabItems={tabsList} onClick={handleChangeTabs} /> : null}
    </ChartSlidingTabButtons>

    <Chart
      list={isHistory ? dataFeedsHistory : volatility}
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
