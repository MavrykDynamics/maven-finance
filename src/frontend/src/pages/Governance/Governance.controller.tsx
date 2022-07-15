import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Page, ModalStyled } from 'styles'
import { ProposalRecordType } from '../../utils/TypesAndInterfaces/Governance'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { State } from '../../reducers'
import { calcTimeToBlock } from '../../utils/calcFunctions'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'
import { getDelegationStorage } from '../Satellites/Satellites.actions'
import { getGovernanceStorage, getCurrentRoundProposals, startNextRound, executeProposal } from './Governance.actions'
import { GovernanceView } from './Governance.view'
import { GovernanceTopBar } from './GovernanceTopBar/GovernanceTopBar.controller'
import { checkIfUserIsSatellite } from '../Satellites/old_version/SatelliteSideBar_old/SatelliteSideBar.controller'
import { MoveNextRoundModal } from './MoveNextRoundModal/MoveNextRoundModal.controller'

// const
import { MOCK_PAST_PROPOSAL_LIST, MOCK_ONGOING_PROPOSAL_LIST, MOCK_EXEC_PROPOSAL_LIST } from './mockProposals'

export type VoteStatistics = {
  passVotesMVKTotal: number
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  abstainVotesMVKTotal: number
  unusedVotesMVKTotal: number
}
export const Governance = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)

  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase, currentRoundProposals, pastProposals } = useSelector(
    (state: State) => state.governance,
  )
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const userIsSatellite = checkIfUserIsSatellite(accountPkh, delegationStorage?.satelliteLedger)
  const [visibleModal, setVisibleModal] = useState(false)
  const [proposalId, setProposalId] = useState<number | null>(null)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  // Period end time calculation
  const { headData } = useSelector((state: State) => state.preferences)

  const timeToEndOfPeriod =
    headData?.knownLevel && governanceStorage?.currentRoundEndLevel
      ? calcTimeToBlock(headData.knownLevel, governanceStorage.currentRoundEndLevel)
      : 0

  const currentDate = new Date()
  const [periodEndsOn, _] = useState<Date>(new Date(currentDate.getTime() + timeToEndOfPeriod * (1000 * 60 * 60 * 24)))
  const daysLeftOfPeriod = timeToEndOfPeriod

  useEffect(() => {
    dispatch(getCurrentRoundProposals())
    dispatch(getGovernanceStorage())
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getDelegationStorage())
  }, [dispatch])

  const proposalLedger = governanceStorage.proposalLedger

  const currentRoundProposalsList = currentRoundProposals?.values ? Array.from(currentRoundProposals.values()) : []
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  const ongoingProposals = currentRoundProposalsList.filter(
    (item) =>
      (isVotingRound || isTimeLockRound) &&
      Boolean(item.currentRoundProposal) &&
      Boolean(item.id === governanceStorage.cycleHighestVotedProposalId),
  )
  const proposalLedgerList = proposalLedger?.values ? Array.from(proposalLedger.values()) : []

  const watingProposals = proposalLedgerList.filter(
    (item: any) => isProposalRound && governanceStorage.timelockProposalId === item.id && !item?.executed,
  ) as ProposalRecordType[]

  const waitingForPaymentToBeProcessed = proposalLedgerList.filter(
    (item: any) =>
      isProposalRound &&
      governanceStorage.timelockProposalId === item.id &&
      item?.executed &&
      !item.paymentProcessed &&
      item?.proposalPayments?.length > 0,
  ) as ProposalRecordType[]

  const handleMoveNextRound = () => {
    dispatch(startNextRound(true))
  }
  const handleExecuteProposal = (id: number) => {
    dispatch(executeProposal(id))
  }
  const handleCloseModal = () => {
    setVisibleModal(false)
  }
  const handleOpenModalMoveNextRound = (id: number) => {
    setVisibleModal(true)
    setProposalId(id)
  }

  return (
    <Page>
      {visibleModal ? (
        <MoveNextRoundModal
          proposalId={proposalId}
          handleCloseModal={handleCloseModal}
          handleExecuteProposal={handleExecuteProposal}
          handleMoveNextRound={handleMoveNextRound}
        />
      ) : null}
      <PageHeader page={'governance'} kind={PRIMARY} loading={loading} />
      <GovernanceTopBar
        governancePhase={governancePhase}
        timeLeftInPhase={daysLeftOfPeriod}
        isInEmergencyGovernance={false}
        loading={loading}
        handleMoveNextRound={handleMoveNextRound}
      />
      <GovernanceView
        handleOpenModalMoveNextRound={handleOpenModalMoveNextRound}
        handleExecuteProposal={handleExecuteProposal}
        ready={ready}
        loading={loading}
        accountPkh={accountPkh}
        userIsSatellite={userIsSatellite}
        ongoingProposals={ongoingProposals}
        nextProposals={currentRoundProposalsList}
        watingProposals={watingProposals}
        waitingForPaymentToBeProcessed={waitingForPaymentToBeProcessed}
        pastProposals={pastProposals}
        governancePhase={governancePhase}
        timeLeftInPhase={daysLeftOfPeriod}
      />
    </Page>
  )
}
