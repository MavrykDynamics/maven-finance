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
    id: 123418,
    title: 'The Hobbit',
    date: 'Dec 13th, 2012, 19:41 UTC',
    mvkBurned: '23541342',
    proposer: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb',
    status: ProposalStatus.DEFEATED,
  },
  {
    id: 123414,
    title: 'Return of the King',
    date: 'Dec 17th, 2003, 15:20 UTC',
    mvkBurned: '123423',
    proposer: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb',
    status: ProposalStatus.EXECUTED,
  },
  {
    id: 123416,
    title: 'The Two Towers',
    date: 'Dec 18th, 2002, 17:36 UTC',
    mvkBurned: '5678956',
    proposer: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
    status: ProposalStatus.EXECUTED,
  },
  {
    id: 123417,
    title: 'Fellowship of the Ring',
    date: 'Dec 19th, 2001, 1:12 UTC',
    mvkBurned: '9634725',
    proposer: 'tz1PrFSuTikuSWfZkACrXpmaS4RuKmEcZMSP',
    status: ProposalStatus.EXECUTED,
  },
]
