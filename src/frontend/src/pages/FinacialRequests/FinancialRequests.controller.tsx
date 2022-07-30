import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// types
import { State } from '../../reducers'

//  actions
import { getGovernanceStorage } from '../Governance/Governance.actions'

// consts
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GovernanceTopBar } from 'pages/Governance/GovernanceTopBar/GovernanceTopBar.controller'

//styles
import { Page } from 'styles'
import { FinancialRequestsView } from './FinancialRequests.view'

export const FinancialRequests = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)

  const { ready } = useSelector((state: State) => state.wallet)
  const {
    governanceStorage: { financialRequestLedger },
    governancePhase,
  } = useSelector((state: State) => state.governance)

  useEffect(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

  return (
    <Page>
      <PageHeader page={'financial requests'} kind={PRIMARY} loading={loading} />
      <GovernanceTopBar governancePhase={governancePhase} />
      <FinancialRequestsView financialRequestsList={financialRequestLedger} ready={ready} loading={loading} />
    </Page>
  )
}
