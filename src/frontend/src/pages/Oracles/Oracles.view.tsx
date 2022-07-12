import { InfoTab } from 'app/App.components/InfoTab/InfoTab.controller'
import { PRIMARY } from 'app/App.components/Modal/Modal.constants'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { SatelliteSideBar } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import React from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper } from './Oracles.styles'
import OraclesSideBar from './OraclesSideBar/OraclesSideBar.controller'

const OraclesView = () => {
  const loading = useSelector((state: State) => {
    console.log(state)
    return state.loading
  })

  return (
    <Page>
      <PageHeader page={'satellites'} kind={PRIMARY} loading={loading} />
      <PageContent>
        <InfoBlockWrapper>
          <InfoTab
            title={'Total Delegated MVK'}
            value={'$64,284,958,904.83'}
            tipLink={'https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle'}
          />
          <InfoTab
            title={'Total Satellites & Oracles'}
            value={'$12'}
            tipLink={'https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle'}
          />
          <InfoTab
            title={'Number of Data Feeds'}
            value={'50+'}
            tipLink={'https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle'}
          />
        </InfoBlockWrapper>
        <OraclesSideBar />
      </PageContent>
    </Page>
  )
}

export default OraclesView
