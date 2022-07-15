import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { ProposalRecordType } from '../../utils/TypesAndInterfaces/Governance'

export default function useGovernence(): {
  watingProposals: ProposalRecordType[]
  waitingForPaymentToBeProcessed: ProposalRecordType[]
} {
  const { governanceStorage, governancePhase, currentRoundProposals, pastProposals } = useSelector(
    (state: State) => state.governance,
  )
  const proposalLedger = governanceStorage.proposalLedger
  const isProposalRound = governancePhase === 'PROPOSAL'
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

  return { watingProposals, waitingForPaymentToBeProcessed }
}
