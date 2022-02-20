import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect, useState } from 'react'
import {
  getBreakGlassStorage,
  getEmergencyGovernanceStorage,
  getGovernanceStorage,
  VoteOnProposal,
} from './Governance.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import { MOCK_ONGOING_PROPOSAL_LIST, MOCK_PAST_PROPOSAL_LIST, MOCK_PROPOSAL_LIST, ProposalData } from './mockProposals'
import { Button } from '../../app/App.components/Button/Button.controller'
import { SUBMIT, TRANSPARENT } from '../../app/App.components/Button/Button.constants'
import { GovernanceView } from './Governance.view'

export const Governance = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)
  const { emergencyGovernanceStorage } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage } = useSelector((state: State) => state.breakGlass)
  const [selected, setSelected] = useState<number>(0)
  const [rightSideContent, setRightSideContent] = useState<ProposalData>({
    id: 0,
    title: 'Grant Program V2',
    proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
    votedMVK: 12324,
    details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
    description:
      'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
    invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
  })
  const [voteStatistics, setVoteStatistics] = useState({
    forVotes: 51254,
    againstVotes: 345,
    abstainingVotes: 60,
    unusedVotes: 12345,
  })
  useEffect(() => {
    dispatch(getGovernanceStorage())
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
  }, [dispatch])

  const handleItemSelect = (chosenProposal: ProposalData) => {
    setSelected(chosenProposal.id === selected ? 0 : chosenProposal.id)
    setRightSideContent(chosenProposal || rightSideContent)
  }

  const handleVoteForProposal = (vote: string) => {
    console.log('Here in Vote for Proposal', vote)
    //TODO: Adjust for the number of votes / voting power each satellite has
    let voteType
    switch (vote) {
      case 'FOR':
        voteType = 1
        setVoteStatistics({ ...voteStatistics, forVotes: voteStatistics.forVotes + 1 })
        break
      case 'AGAINST':
        voteType = 0
        setVoteStatistics({ ...voteStatistics, againstVotes: voteStatistics.againstVotes + 1 })
        break
      case 'ABSTAIN':
      default:
        voteType = 2
        setVoteStatistics({ ...voteStatistics, abstainingVotes: voteStatistics.abstainingVotes + 1 })
        break
    }
    setVoteStatistics({ ...voteStatistics, unusedVotes: voteStatistics.unusedVotes - 1 })
    dispatch(VoteOnProposal(voteType))
  }
  return (
    <Page>
      <PageHeader page={'governance'} kind={PRIMARY} loading={loading} />
      <GovernanceView
        ready={ready}
        loading={loading}
        accountPkh={accountPkh}
        ongoingProposals={MOCK_ONGOING_PROPOSAL_LIST}
        nextProposals={MOCK_PROPOSAL_LIST}
        pastProposals={MOCK_PAST_PROPOSAL_LIST}
        handleVoteForProposal={handleVoteForProposal}
        handleItemSelect={handleItemSelect}
        selectedProposal={rightSideContent}
        governancePhase={governancePhase}
        voteStatistics={voteStatistics}
      />
    </Page>
  )
}
