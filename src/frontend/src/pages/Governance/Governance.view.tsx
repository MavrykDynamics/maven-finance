import {
  GovernanceLeftContainer,
  GovernanceRightContainer,
  GovernanceStyled,
  RightSideSubContent,
  RightSideSubHeader,
  RightSideVotingArea,
} from './Governance.style'
import { ProposalData } from './mockProposals'
import * as React from 'react'
import { GovernancePhase } from '../../reducers/governance'
import { Proposals } from './Proposals/Proposals.controller'
import { VotingArea } from './VotingArea/VotingArea.controller'

type GovernanceViewProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
  ongoingProposals: Map<string, ProposalData>
  nextProposals: Map<string, ProposalData>
  pastProposals: Map<string, ProposalData>
  governancePhase: GovernancePhase
  handleVoteForProposal: (vote: string) => void
  handleItemSelect: (proposalListItem: ProposalData) => void
  selectedProposal: ProposalData
  voteStatistics: any
}

export const GovernanceView = ({
  ready,
  loading,
  accountPkh,
  ongoingProposals,
  nextProposals,
  pastProposals,
  governancePhase,
  handleVoteForProposal,
  handleItemSelect,
  selectedProposal,
  voteStatistics,
}: GovernanceViewProps) => {
  return (
    <GovernanceStyled>
      <GovernanceLeftContainer>
        {governancePhase === 'VOTING' && (
          <Proposals
            governancePhase={'VOTING'}
            proposalsList={ongoingProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
          />
        )}
        {governancePhase === 'PROPOSAL' && (
          <Proposals
            governancePhase={'PROPOSAL'}
            proposalsList={nextProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
          />
        )}
        <Proposals
          governancePhase={'PROPOSAL_HISTORY'}
          proposalsList={pastProposals}
          handleItemSelect={handleItemSelect}
          selectedProposal={selectedProposal}
        />
      </GovernanceLeftContainer>
      <GovernanceRightContainer>
        <h1>{selectedProposal.title}</h1>
        <RightSideSubContent id="votingDeadline">Voting ending on September 12th, 05:16 CEST</RightSideSubContent>
        <VotingArea
          ready={ready}
          loading={loading}
          accountPkh={accountPkh}
          handleVoteForProposal={handleVoteForProposal}
          selectedProposal={selectedProposal}
          voteStatistics={voteStatistics}
        />
        <div>
          <RightSideSubHeader>Details</RightSideSubHeader>
          <RightSideSubContent>{selectedProposal.details}</RightSideSubContent>
        </div>
        <div>
          <RightSideSubHeader>Description</RightSideSubHeader>
          <RightSideSubContent>{selectedProposal.description}</RightSideSubContent>
        </div>
        <div>
          <RightSideSubHeader>Proposer</RightSideSubHeader>
          <RightSideSubContent>{selectedProposal.proposer}</RightSideSubContent>
        </div>
        <div>
          <a target="_blank" rel="noopener noreferrer" href={selectedProposal.invoiceHash}>
            <p>Invoice</p>
          </a>
        </div>
      </GovernanceRightContainer>
    </GovernanceStyled>
  )
}
