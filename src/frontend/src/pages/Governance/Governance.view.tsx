import {
  GovernanceLeftContainer,
  GovernanceRightContainer,
  GovernanceStyled,
  GovRightContainerTitleArea,
  RightSideSubContent,
  RightSideSubHeader,
} from './Governance.style'
import * as React from 'react'
import { GovernancePhase } from '../../reducers/governance'
import { Proposals } from './Proposals/Proposals.controller'
import { VotingArea } from './VotingArea/VotingArea.controller'
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { useLocation } from 'react-router-dom'
import { Table } from '../../app/App.components/Table/Table.controller'
import { ProposalRecordType } from '../../utils/TypesAndInterfaces/Governance'
import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { SatelliteDescriptionText } from '../SatelliteDetails/SatelliteDetails.style'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
type GovernanceViewProps = {
  ready: boolean
  loading: boolean
  accountPkh: string | undefined
  ongoingProposals?: Map<string, ProposalRecordType>
  nextProposals: Map<string, ProposalRecordType>
  pastProposals?: Map<string, ProposalRecordType>
  governancePhase: GovernancePhase
  handleProposalRoundVote: (proposalId: number) => void
  handleVotingRoundVote: (vote: string) => void
  handleItemSelect: (proposalListItem: ProposalRecordType) => void
  selectedProposal: ProposalRecordType
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
  handleProposalRoundVote,
  handleVotingRoundVote,
  handleItemSelect,
  selectedProposal,
  voteStatistics,
}: GovernanceViewProps) => {
  const location = useLocation()
  const onProposalHistoryPage = location.pathname === '/proposal-history'
  // const options: HTMLReactParserOptions = {
  //   replace: (domNode: any) => {
  //     const isElement: boolean = domNode.type && domNode.type === 'tag' && domNode.name
  //     if (!domNode.attribs || (isElement && domNode.name === 'script')) return
  //     if (isElement) {
  //       if (domNode.name === 'strong') {
  //         return (
  //           <SatelliteDescriptionText fontWeight={700}>
  //             {domToReact(domNode.children, options)}
  //           </SatelliteDescriptionText>
  //         )
  //       } else if (domNode.name === 'p') {
  //         return (
  //           <SatelliteDescriptionText fontWeight={400}>
  //             {domToReact(domNode.children, options)}
  //           </SatelliteDescriptionText>
  //         )
  //       } else return
  //     } else return
  //   },
  // }

  return (
    <GovernanceStyled>
      <GovernanceLeftContainer>
        {!onProposalHistoryPage && ongoingProposals !== undefined && governancePhase === 'VOTING' && (
          <Proposals
            proposalsList={ongoingProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
          />
        )}
        {!onProposalHistoryPage && ongoingProposals !== undefined && governancePhase === 'TIME_LOCK' && (
          <Proposals
            proposalsList={ongoingProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
          />
        )}
        {!onProposalHistoryPage && nextProposals !== undefined && governancePhase === 'PROPOSAL' && (
          <Proposals
            proposalsList={nextProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
          />
        )}
        {onProposalHistoryPage && pastProposals !== undefined && (
          <Proposals
            proposalsList={pastProposals}
            handleItemSelect={handleItemSelect}
            selectedProposal={selectedProposal}
            isProposalHistory={true}
          />
        )}
      </GovernanceLeftContainer>
      <GovernanceRightContainer>
        {selectedProposal && (
          <>
            <GovRightContainerTitleArea>
              <h1>{selectedProposal.title}</h1>
              <StatusFlag text={selectedProposal.status} status={selectedProposal.status} />
            </GovRightContainerTitleArea>

            <RightSideSubContent id="votingDeadline">Voting ending on September 12th, 05:16 CEST</RightSideSubContent>
            <VotingArea
              ready={ready}
              loading={loading}
              accountPkh={accountPkh}
              handleProposalRoundVote={handleProposalRoundVote}
              handleVotingRoundVote={handleVotingRoundVote}
              selectedProposal={selectedProposal}
              voteStatistics={voteStatistics}
            />
            {/*<div>*/}
            {/*  <RightSideSubHeader>Details</RightSideSubHeader>*/}
            {/*  <RightSideSubContent>{selectedProposal.details}</RightSideSubContent>*/}
            {/*</div>*/}
            <div>
              <RightSideSubHeader>Description</RightSideSubHeader>
              <RightSideSubContent>{selectedProposal.description}</RightSideSubContent>
            </div>
            <div>
              <RightSideSubHeader>Proposer</RightSideSubHeader>
              <RightSideSubContent>
                <TzAddress tzAddress={selectedProposal.proposerAddress} type={'primary'} hasIcon={true} isBold={true} />
              </RightSideSubContent>
            </div>
            <div>
              <a target="_blank" rel="noopener noreferrer" href={selectedProposal.invoice}>
                <p>Invoice</p>
              </a>
            </div>
            {/*<Table tableData={selectedProposal.invoiceTable} />*/}
          </>
        )}
      </GovernanceRightContainer>
    </GovernanceStyled>
  )
}
