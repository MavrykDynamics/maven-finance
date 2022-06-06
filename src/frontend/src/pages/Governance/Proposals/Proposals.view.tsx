import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'
import { ProposalItemLeftSide, ProposalListContainer, ProposalListItem } from './Proposals.style'

type ProposalsViewProps = {
  listTitle: string
  proposalsList: Map<string, ProposalRecordType>
  handleItemSelect: (proposalListItem: ProposalRecordType | undefined) => void
  selectedProposal: ProposalRecordType | undefined
  isProposalPhase: boolean
  firstVisible: boolean
}
export const ProposalsView = ({
  listTitle,
  proposalsList,
  handleItemSelect,
  selectedProposal,
  isProposalPhase,
  firstVisible,
}: ProposalsViewProps) => {
  const listProposalsArray = proposalsList?.values ? Array.from(proposalsList.values()) : []
  const location = useLocation()

  useEffect(() => {
    if (firstVisible) handleItemSelect(listProposalsArray[0])
  }, [proposalsList, firstVisible])

  useEffect(() => {
    handleItemSelect(undefined)
  }, [location.pathname, proposalsList])

  if (!listProposalsArray.length) {
    return null
  }

  return (
    <ProposalListContainer>
      <h1>{listTitle}</h1>
      {listProposalsArray.length &&
        listProposalsArray.map((value, index) => {
          return (
            <ProposalListItem
              key={value.id}
              onClick={() => handleItemSelect(value)}
              selected={selectedProposal ? selectedProposal.id === value.id : value.id === 1}
            >
              <ProposalItemLeftSide>
                <span>{value.id}</span>
                <h4>{value.title}</h4>
              </ProposalItemLeftSide>
              {isProposalPhase && (
                <CommaNumber
                  className="proposal-voted-mvk"
                  value={value.passVoteMvkTotal || 0}
                  endingText={'voted MVK'}
                />
              )}
              <StatusFlag text={value?.status} status={value.status} />
            </ProposalListItem>
          )
        })}
    </ProposalListContainer>
  )
}
