import {
  GovernanceLeftContainer,
  GovernanceRightContainer,
  GovernanceStyled,
  GovRightContainerTitleArea,
  RightSideSubContent,
  RightSideSubHeader,
} from './Governance.style'
import { ProposalData } from './mockProposals'
import * as React from 'react'
import { GovernancePhase } from '../../reducers/governance'
import { Proposals } from './Proposals/Proposals.controller'
import { VotingArea } from './VotingArea/VotingArea.controller'
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Table } from '../../app/App.components/Table/Table.controller'

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
  const location = useLocation()
  const onProposalHistoryPage = location.pathname === '/proposal-history'
  return (
    <GovernanceStyled>
      <GovernanceLeftContainer>
        {!onProposalHistoryPage && governancePhase === 'VOTING' && (
          <Proposals
            proposalsList={ongoingProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
          />
        )}
        {!onProposalHistoryPage && governancePhase === 'TIME_LOCK' && (
          <Proposals
            proposalsList={ongoingProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
          />
        )}
        {!onProposalHistoryPage && governancePhase === 'PROPOSAL' && (
          <Proposals
            proposalsList={nextProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
          />
        )}
        {onProposalHistoryPage && (
          <Proposals
            proposalsList={pastProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
            isProposalHistory={true}
          />
        )}
      </GovernanceLeftContainer>
      <GovernanceRightContainer>
        <GovRightContainerTitleArea>
          <h1>{selectedProposal.title}</h1>
          <StatusFlag text={selectedProposal.status} status={selectedProposal.status} />
        </GovRightContainerTitleArea>

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
        <Table tableData={selectedProposal.invoiceTable} />
      </GovernanceRightContainer>
    </GovernanceStyled>
  )
}
