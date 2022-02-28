import { ProposalItemLeftSide, ProposalListContainer, ProposalListItem } from './Proposals.style'
import * as React from 'react'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'

type ProposalsViewProps = {
  listTitle: string
  proposalsList: Map<string, ProposalRecordType>
  handleItemSelect: (proposalListItem: ProposalRecordType) => void
  selectedProposal: ProposalRecordType
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
      {proposalsList &&
        Array.from(proposalsList.values()).map((value, index) => {
          return (
            <ProposalListItem
              key={value.id}
              onClick={() => handleItemSelect(value)}
              selected={selectedProposal.id === value.id}
            >
              <ProposalItemLeftSide>
                <div>{value.id}</div>
                <h4>{value.title}</h4>
              </ProposalItemLeftSide>
              <div>
                {/*{isProposalPhase && <CommaNumber value={value.votedMVK} endingText={'voted MVK'} />}*/}
                {/*{!isProposalPhase && <StatusFlag text={value?.status} status={value.status} />}*/}
              </div>
            </ProposalListItem>
          )
        })}
    </ProposalListContainer>
  )
}
