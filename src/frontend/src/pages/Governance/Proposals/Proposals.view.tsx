import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// helpers
import { normalizeProposalStatus } from '../Governance.helpers'

// view
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalRecordType } from '../../../utils/TypesAndInterfaces/Governance'

// style
import { ProposalItemLeftSide, ProposalListContainer, ProposalListItem } from './Proposals.style'

type ProposalsViewProps = {
  listTitle: string
  proposalsList: ProposalRecordType[]
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
  const { governancePhase } = useSelector((state: State) => state.governance)
  const location = useLocation()

  useEffect(() => {
    if (firstVisible) handleItemSelect(proposalsList[0])
  }, [proposalsList, firstVisible])

  useEffect(() => {
    handleItemSelect(undefined)
  }, [location.pathname, proposalsList])

  if (!proposalsList.length) {
    return null
  }

  return (
    <ProposalListContainer>
      <h1>{listTitle}</h1>
      {proposalsList.length &&
        proposalsList.map((value, index) => {
          const contentStatus = normalizeProposalStatus(
            governancePhase,
            value?.status ?? 0,
            Boolean(value?.executed),
            Boolean(value?.locked),
          )
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
              <StatusFlag text={contentStatus} status={contentStatus} />
            </ProposalListItem>
          )
        })}
    </ProposalListContainer>
  )
}
