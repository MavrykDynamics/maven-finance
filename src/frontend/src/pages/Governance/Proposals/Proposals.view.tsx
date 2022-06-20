import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// helpers
import { normalizeProposalStatus, getProposalStatusInfo } from '../Governance.helpers'

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
  const { governancePhase, governanceStorage } = useSelector((state: State) => state.governance)
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
        proposalsList.map((proposal, index) => {
          const statusInfo = getProposalStatusInfo(
            governancePhase,
            proposal,
            governanceStorage.timelockProposalId,
            isProposalPhase,
            governanceStorage.getProposalStatusInfo,
            governanceStorage.cycleCounter,
          )

          // const contentStatus = normalizeProposalStatus(
          //   governancePhase,
          //   proposal?.status ?? 0,
          //   Boolean(proposal?.executed),
          //   Boolean(proposal?.locked),
          //   isProposalPhase,
          // )

          const contentStatus = statusInfo.statusFlag
          console.log('%c ||||| statusInfo', 'color:yellowgreen', statusInfo)

          const dividedPassVoteMvkTotal = proposal.passVoteMvkTotal / 1_000_000_000
          return (
            <ProposalListItem
              key={proposal.id}
              onClick={() => handleItemSelect(proposal)}
              selected={selectedProposal ? selectedProposal.id === proposal.id : proposal.id === 1}
            >
              <ProposalItemLeftSide>
                <span>{index + 1}</span>
                <h4>{proposal.title}</h4>
              </ProposalItemLeftSide>
              {isProposalPhase && (
                <CommaNumber className="proposal-voted-mvk" value={dividedPassVoteMvkTotal} endingText={'voted MVK'} />
              )}
              <StatusFlag text={contentStatus} status={contentStatus} />
            </ProposalListItem>
          )
        })}
    </ProposalListContainer>
  )
}
