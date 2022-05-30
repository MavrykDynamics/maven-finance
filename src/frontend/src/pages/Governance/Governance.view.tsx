import * as React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { EmptyContainer } from '../../app/App.style'
import { GovernancePhase } from '../../reducers/governance'
import { ProposalRecordType } from '../../utils/TypesAndInterfaces/Governance'
import { VoteStatistics } from './Governance.controller'

import {
  GovernanceLeftContainer,
  GovernanceRightContainer,
  GovernanceStyled,
  GovRightContainerTitleArea,
  RightSideSubContent,
  RightSideSubHeader,
} from './Governance.style'
import { Proposals } from './Proposals/Proposals.controller'
import { VotingArea } from './VotingArea/VotingArea.controller'

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
  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)
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

  // useEffect(() => {
  //   if (rightSideContent?.id === 0 && selectedProposal?.id !== 0) {
  //     setRightSideContent(selectedProposal)
  //   }
  // }, [rightSideContent?.id, selectedProposal])

  const _handleItemSelect = (chosenProposal: ProposalRecordType | undefined) => {
    if (chosenProposal) {
      setSelectedProposalToShow(
        chosenProposal.id === selectedProposalToShow ? selectedProposalToShow : chosenProposal.id,
      )
      setRightSideContent(chosenProposal)
      setVoteStatistics({
        passVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
        forVotesMVKTotal: Number(chosenProposal.upvoteMvkTotal),
        againstVotesMVKTotal: Number(chosenProposal.downvoteMvkTotal),
        abstainVotesMVKTotal: Number(chosenProposal.abstainMvkTotal),
        //TODO: Correct calculation for unused votes count
        unusedVotesMVKTotal: Number(chosenProposal.passVoteMvkTotal),
      })
    }
  }

  console.log('%c ||||| selectedProposalToShow', 'color:yellowgreen', selectedProposalToShow)

  const emptyContainer = (
    <EmptyContainer>
      <img src="/images/not-found.svg" alt=" No proposals to show" />
      <figcaption> No proposals to show</figcaption>
    </EmptyContainer>
  )

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

      {rightSideContent && rightSideContent.id !== 0 ? (
        <GovernanceRightContainer>
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
          <hr />
          <article>
            <RightSideSubHeader>Details</RightSideSubHeader>
            <RightSideSubContent>{rightSideContent.details}</RightSideSubContent>
          </article>
          <article>
            <RightSideSubHeader>Description</RightSideSubHeader>
            <RightSideSubContent>{rightSideContent.description}</RightSideSubContent>
          </article>
          <article>
            <RightSideSubHeader>Proposer</RightSideSubHeader>
            <RightSideSubContent>
              <TzAddress tzAddress={rightSideContent.proposerId} hasIcon={true} isBold={true} />
            </RightSideSubContent>
          </article>
          <article>
            <a target="_blank" rel="noopener noreferrer" href={rightSideContent.invoice}>
              <p>Invoice</p>
            </a>
          </article>
          {/*<Table tableData={selectedProposal.invoiceTable} />*/}
        </GovernanceRightContainer>
      ) : null}
    </GovernanceStyled>
  )
}
