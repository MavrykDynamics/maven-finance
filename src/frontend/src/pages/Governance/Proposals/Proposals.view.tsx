import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { ProposalItemLeftSide, ProposalListContainer, ProposalListItem } from './Proposals.style'
import {
  GovernanceLeftContainer,
  GovernanceRightContainer,
  GovernanceStyled,
  GovRightContainerTitleArea,
  RightSideSubContent,
  RightSideSubHeader,
} from '../Governance.style'

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
  const listProposalsArray = proposalsList?.values ? Array.from(proposalsList.values()) : []
  const location = useLocation()
  const [currentProposal, setCurrentProposal] = useState<ProposalRecordType | undefined>(undefined)

  useEffect(() => {
    console.log('%c ||||| currentProposal', 'color:red', currentProposal)
    if (!currentProposal) setCurrentProposal(listProposalsArray[0])
  }, [listProposalsArray, currentProposal])

  useEffect(() => {
    setCurrentProposal(undefined)
  }, [location.pathname, proposalsList])

  return (
    <>
      <GovernanceLeftContainer>
        <ProposalListContainer>
          <h1>{listTitle}</h1>
          {listProposalsArray.length &&
            listProposalsArray.map((value, index) => {
              return (
                <ProposalListItem
                  key={value.id}
                  onClick={() => setCurrentProposal(value)}
                  selected={currentProposal ? currentProposal.id === value.id : value.id === 1}
                >
                  <ProposalItemLeftSide>
                    <span>{value.id}</span>
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
      </GovernanceLeftContainer>
      {currentProposal && currentProposal.id !== 0 ? (
        <GovernanceRightContainer>
          <GovRightContainerTitleArea>
            <h1>{currentProposal.title}</h1>
            <StatusFlag text={currentProposal.status} status={currentProposal.status} />
          </GovRightContainerTitleArea>
          <RightSideSubContent id="votingDeadline">Voting ending on September 12th, 05:16 CEST</RightSideSubContent>
          {/* <VotingArea
            ready={ready}
            loading={loading}
            accountPkh={accountPkh}
            handleProposalRoundVote={handleProposalRoundVote}
            handleVotingRoundVote={handleVotingRoundVote}
            currentProposal={currentProposal}
            voteStatistics={voteStatistics}
          /> */}
          <hr />
          <article>
            <RightSideSubHeader>Details</RightSideSubHeader>
            <RightSideSubContent>{currentProposal.details}</RightSideSubContent>
          </article>
          <article>
            <RightSideSubHeader>Description</RightSideSubHeader>
            <RightSideSubContent>{currentProposal.description}</RightSideSubContent>
          </article>
          <article>
            <RightSideSubHeader>Proposer</RightSideSubHeader>
            <RightSideSubContent>
              <TzAddress tzAddress={currentProposal.proposerId} hasIcon={true} isBold={true} />
            </RightSideSubContent>
          </article>
          <article>
            <a target="_blank" rel="noopener noreferrer" href={currentProposal.invoice}>
              <p>Invoice</p>
            </a>
          </article>
          {/*<Table tableData={currentProposal.invoiceTable} />*/}
        </GovernanceRightContainer>
      ) : null}
    </>
  )
}
