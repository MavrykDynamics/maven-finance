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
import { ProposalRecordType } from '../../utils/TypesAndInterfaces/Governance'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { useEffect, useState } from 'react'
import { VoteStatistics } from './Governance.controller'
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
  setVoteStatistics: (voteStatistics: VoteStatistics) => void
  selectedProposal: ProposalRecordType | undefined
  voteStatistics: VoteStatistics
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
  setVoteStatistics,
  selectedProposal,
  voteStatistics,
}: GovernanceViewProps) => {
  const location = useLocation()
  const onProposalHistoryPage = location.pathname === '/proposal-history'
  const [selectedProposalToShow, setSelectedProposalToShow] = useState<number>(Number(selectedProposal?.id || 1))
  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(selectedProposal)
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

  useEffect(() => {
    if (rightSideContent?.id === 0 && selectedProposal?.id !== 0) {
      setRightSideContent(selectedProposal)
    }
  }, [rightSideContent?.id, selectedProposal])

  const _handleItemSelect = (chosenProposal: ProposalRecordType) => {
    setSelectedProposalToShow(chosenProposal.id === selectedProposalToShow ? selectedProposalToShow : chosenProposal.id)
    setRightSideContent(chosenProposal)
    setVoteStatistics({
      passVotesCount: Number(chosenProposal.passVoteCount),
      passVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
      forVotesCount: Number(chosenProposal.upvoteCount),
      forVotesMVKTotal: Number(chosenProposal.upvoteMvkTotal),
      againstVotesCount: Number(chosenProposal.downvoteCount),
      againstVotesMVKTotal: Number(chosenProposal.downvoteMvkTotal),
      abstainVotesCount: Number(chosenProposal.abstainCount),
      abstainVotesMVKTotal: Number(chosenProposal.abstainMvkTotal),
      //TODO: Correct calculation for unused votes count
      unusedVotesCount: Number(chosenProposal.abstainCount),
      unusedVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
    })
  }
  return (
    <GovernanceStyled>
      <GovernanceLeftContainer>
        {!onProposalHistoryPage && ongoingProposals !== undefined && governancePhase === 'VOTING' && (
          <Proposals
            proposalsList={ongoingProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
          />
        )}
        {!onProposalHistoryPage && ongoingProposals !== undefined && governancePhase === 'TIME_LOCK' && (
          <Proposals
            proposalsList={ongoingProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
          />
        )}
        {!onProposalHistoryPage && nextProposals !== undefined && governancePhase === 'PROPOSAL' && (
          <Proposals
            proposalsList={nextProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
          />
        )}
        {onProposalHistoryPage && pastProposals !== undefined && (
          <Proposals
            proposalsList={pastProposals}
            handleItemSelect={_handleItemSelect}
            selectedProposal={rightSideContent}
            isProposalHistory={true}
          />
        )}
      </GovernanceLeftContainer>
      <GovernanceRightContainer>
        {rightSideContent && rightSideContent.id !== 0 ? (
          <>
            <GovRightContainerTitleArea>
              <h1>{rightSideContent.title}</h1>
              <StatusFlag text={rightSideContent.status} status={rightSideContent.status} />
            </GovRightContainerTitleArea>

            <RightSideSubContent id="votingDeadline">Voting ending on September 12th, 05:16 CEST</RightSideSubContent>
            <VotingArea
              ready={ready}
              loading={loading}
              accountPkh={accountPkh}
              handleProposalRoundVote={handleProposalRoundVote}
              handleVotingRoundVote={handleVotingRoundVote}
              selectedProposal={rightSideContent}
              voteStatistics={voteStatistics}
            />
            {/*<div>*/}
            {/*  <RightSideSubHeader>Details</RightSideSubHeader>*/}
            {/*  <RightSideSubContent>{selectedProposal.details}</RightSideSubContent>*/}
            {/*</div>*/}
            <div>
              <RightSideSubHeader>Description</RightSideSubHeader>
              <RightSideSubContent>{rightSideContent.description}</RightSideSubContent>
            </div>
            <div>
              <RightSideSubHeader>Proposer</RightSideSubHeader>
              <RightSideSubContent>
                <TzAddress tzAddress={rightSideContent.proposerAddress} type={'primary'} hasIcon={true} isBold={true} />
              </RightSideSubContent>
            </div>
            <div>
              <a target="_blank" rel="noopener noreferrer" href={rightSideContent.invoice}>
                <p>Invoice</p>
              </a>
            </div>
            {/*<Table tableData={selectedProposal.invoiceTable} />*/}
          </>
        ) : (
          <GovRightContainerTitleArea>
            <h1>No proposal to show</h1>
          </GovRightContainerTitleArea>
        )}
      </GovernanceRightContainer>
    </GovernanceStyled>
  )
}
