import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import OracleList from '../Satellites/SatelliteList/SatellitesList.view'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'

// styles
import { Page } from 'styles'
import { DataFeedsStyled } from './DataFeeds.styles'

export const DataFeeds = () => {
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => state.loading)
  const { user } = useSelector((state: State) => state.user)

  const delegateCallback = () => {}

  const oracleSatellitesData = {
    userStakedBalance: user.mySMvkTokenBalance,
    satelliteUserIsDelegatedTo: user.satelliteMvkIsDelegatedTo,
    items: oraclesStorage.feeds,
  }

  return (
    <Page>
      <PageHeader page={'data-feeds'} kind={PRIMARY} loading={false} />
      <DataFeedsStyled>
        <OracleList
          listTitle={'Data feeds'}
          loading={loading}
          items={oraclesStorage.feeds}
          listType={'feeds'}
          name={'topSatelitesOracle'}
          onClickHandler={delegateCallback}
          additionaldata={oracleSatellitesData}
          noItemsText={'No oracle-satellites'}
        />
      </DataFeedsStyled>
    </Page>
  )
}
