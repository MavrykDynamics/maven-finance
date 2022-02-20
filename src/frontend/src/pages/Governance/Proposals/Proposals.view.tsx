import { ProposalItemLeftSide, ProposalListContainer, ProposalListItem, ProposalStatusFlag } from './Proposals.style'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import * as React from 'react'
import { ProposalData, ProposalStatus } from '../mockProposals'

type ProposalsViewProps = {
  listTitle: string
  proposalsList: Map<string, ProposalData>
  handleItemSelect: (proposalListItem: ProposalData) => void
  selectedProposal: ProposalData
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
      {Array.from(proposalsList.values()).map((value, index) => {
        return (
          <ProposalListItem
            key={value.id}
            onClick={() => handleItemSelect(value)}
            selected={selectedProposal.id === value.id}
          >
            <ProposalItemLeftSide>
              <div>{isProposalPhase ? index : value.version}</div>
              <h4>{value.title}</h4>
            </ProposalItemLeftSide>
            <div>
              {isProposalPhase ? (
                <CommaNumber value={value.votedMVK} endingText={'voted MVK'} />
              ) : (
                <ProposalStatusFlag status={value.status || ProposalStatus.DISCOVERY}>
                  {value.status}
                </ProposalStatusFlag>
              )}
            </div>
          </ProposalListItem>
        )
      })}
    </ProposalListContainer>
  )
}
