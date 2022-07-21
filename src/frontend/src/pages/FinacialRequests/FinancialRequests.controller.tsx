import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// types
import { State } from '../../reducers'

// helpers, actions
import { calcTimeToBlock } from '../../utils/calcFunctions'
import { getGovernanceStorage, startNextRound } from '../Governance/Governance.actions'

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
    governanceStorage: { financialRequestLedger, currentRoundEndLevel },
    governancePhase,
  } = useSelector((state: State) => state.governance)
  const { headData } = useSelector((state: State) => state.preferences)
  console.log(financialRequestLedger)
  const daysLeftOfPeriod = calcTimeToBlock(headData?.knownLevel, currentRoundEndLevel)

  useEffect(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

  // NEXT ROUND MODALS STAFF
  // const [visibleModal, setVisibleModal] = useState(false)
  const handleMoveNextRound = () => {
    dispatch(startNextRound(false))
  }
  // const handleExecuteProposal = (id: number) => {
  //   dispatch(executeProposal(id))
  // }
  // const handleOpenModalMoveNextRound = (id: number) => {
  //   setVisibleModal(true)
  //   setProposalId(id)
  // }

  return (
    <Page>
      <PageHeader page={'financial requests'} kind={PRIMARY} loading={loading} />
      <GovernanceTopBar
        governancePhase={governancePhase}
        timeLeftInPhase={daysLeftOfPeriod}
        isInEmergencyGovernance={false}
        loading={loading}
        handleMoveNextRound={handleMoveNextRound}
      />
      <FinancialRequestsView financialRequestsList={financialRequestLedger} ready={ready} loading={loading} />
    </Page>
  )
}
