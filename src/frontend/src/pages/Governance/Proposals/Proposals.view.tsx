import * as React from 'react'

import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import { ProposalItemLeftSide, ProposalListContainer, ProposalListItem } from './Proposals.style'

type ProposalsViewProps = {
  listTitle: string
  proposalsList: Map<string, ProposalRecordType>
  handleItemSelect: (proposalListItem: ProposalRecordType) => void
  selectedProposal: ProposalRecordType | undefined
  isProposalPhase: boolean
}
export const ProposalsView = ({
  listTitle,
  proposalsList,
  handleItemSelect,
  selectedProposal,
  isProposalPhase,
}: ProposalsViewProps) => {
  return (
    <ProposalListContainer>
      <h1>{listTitle}</h1>
      {proposalsList?.values &&
        Array.from(proposalsList.values()).map((value, index) => {
          return (
            <ProposalListItem
              key={value.id}
              onClick={() => handleItemSelect(value)}
              selected={selectedProposal ? selectedProposal.id === value.id : value.id === 1}
            >
              <ProposalItemLeftSide>
                <div>{value.id}</div>
                <h4>{value.title}</h4>
              </ProposalItemLeftSide>
              <div>
                {isProposalPhase && <CommaNumber value={value.passVoteMvkTotal || 0} endingText={'voted MVK'} />}
                {!isProposalPhase && <StatusFlag text={value?.status} status={value.status} />}
              </div>
            </ProposalListItem>
          )
        })}
    </ProposalListContainer>
  )
}
