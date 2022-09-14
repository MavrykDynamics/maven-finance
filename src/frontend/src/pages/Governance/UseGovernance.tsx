import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { GovernanceProposalGraphQL, ProposalRecordType } from '../../utils/TypesAndInterfaces/Governance'

export default function useGovernence(): {
  watingProposals: ProposalRecordType[]
  waitingForPaymentToBeProcessed: ProposalRecordType[]
} {
  const { governanceStorage, governancePhase, currentRoundProposals, pastProposals } = useSelector(
    (state: State) => state.governance,
  )
  const proposalLedger = governanceStorage.proposalLedger
  const isProposalRound = governancePhase === 'PROPOSAL'
  const proposalLedgerList = proposalLedger

  const watingProposals = proposalLedgerList.filter(
    (item) => isProposalRound && governanceStorage.timelockProposalId === item.id && !item?.executed,
  )

  const waitingForPaymentToBeProcessed = proposalLedgerList.filter(
    (item) =>
      isProposalRound &&
      governanceStorage.timelockProposalId === item.id &&
      item?.executed &&
      !item.paymentProcessed &&
      item?.proposalPayments?.length > 0,
  )

  return { watingProposals, waitingForPaymentToBeProcessed }
}
