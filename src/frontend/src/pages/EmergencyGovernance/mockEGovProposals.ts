import { ProposalStatus } from '../../utils/TypesAndInterfaces/Governance'

export interface EmergencyGovernancePastProposal {
  id: number
  title: string
  date: string
  mvkBurned: string
  proposer: string
  status: ProposalStatus
}

export const MOCK_E_GOV_PAST_PROPOSALS: EmergencyGovernancePastProposal[] = [
  {
    id: 123414,
    title: 'Treasury Leak',
    date: 'Feb 5th, 2022, 15:20 UTC',
    mvkBurned: '123423',
    proposer: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb',
    status: ProposalStatus.EXECUTED,
  },
  {
    id: 123416,
    title: 'MVK Leak',
    date: 'Aug 7th, 2021, 17:12 UTC',
    mvkBurned: '5678956',
    proposer: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb',
    status: ProposalStatus.DEFEATED,
  },
  {
    id: 123417,
    title: 'Broseph Hackers',
    date: 'Mar 8th, 2021, 19:41 UTC',
    mvkBurned: '23541342',
    proposer: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb',
    status: ProposalStatus.EXECUTED,
  },
]
