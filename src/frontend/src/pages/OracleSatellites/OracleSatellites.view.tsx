import { InfoTab } from 'app/App.components/InfoTab/InfoTab.controller'
import { PRIMARY } from 'app/App.components/Modal/Modal.constants'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { getOracleSatellites } from 'pages/Oracles/Oracles.actions'
import { InfoBlockWrapper } from 'pages/Oracles/Oracles.styles'
import OracleList from 'pages/Oracles/OraclesList/OraclesList.view'
import OraclesSideBar from 'pages/Oracles/OraclesSideBar/OraclesSideBar.controller'
import { getTotalDelegatedMVK } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { State } from 'reducers'
import { Page, PageContent } from 'styles'

const OracleSatellites = () => {
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => state.loading)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getOracleSatellites())
  }, [])

  return (
    <Page>
      <PageHeader page={'satellites'} kind={PRIMARY} loading={loading} />
      <OracleList
        loading={loading}
        items={oraclesStorage.oraclesSatellites}
        listType={'satellites'}
        name={'topSatelitesOracle'}
        onClickHandler={() => null}
        noItemsText={'No oracle-satellites'}
        additionaldata={{
          isAllOracles: true,
        }}
      />
    </Page>
  )
}

export default OracleSatellites
