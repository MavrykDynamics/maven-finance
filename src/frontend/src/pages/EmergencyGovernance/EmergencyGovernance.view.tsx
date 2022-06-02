import * as React from 'react'

// types
import type { EmergencyGovernanceLedgerType } from './EmergencyGovernance.controller'

import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../app/App.components/Button/Button.constants'
import { Button } from '../../app/App.components/Button/Button.controller'
import { ConnectWallet } from '../../app/App.components/ConnectWallet/ConnectWallet.controller'
import { FAQLink } from '../Satellites/SatelliteSideBar/SatelliteSideBar.style'
import { EGovHistoryCard } from './EGovHistoryCard/EGovHistoryCard.controller'
import {
  CardContent,
  CardContentLeftSide,
  CardContentRightSide,
  EmergencyGovernanceCard,
  EmergencyGovernHistory,
  CardContentVoiting,
} from './EmergencyGovernance.style'
import { EmergencyGovernancePastProposal } from './mockEGovProposals'
import { VotingArea } from '../Governance/VotingArea/VotingArea.controller'
import { ProposalRecordType } from '../../utils/TypesAndInterfaces/Governance'
import { VoteStatistics } from '../Governance/Governance.controller'

type Props = {
  ready: boolean
  loading: boolean
  accountPkh?: any
  emergencyGovernanceActive: boolean
  glassBroken: boolean
  handleVoteForEmergencyProposal: () => void
  handleTriggerEmergencyProposal: () => void
  handleProposalRoundVote: (proposalId: number) => void
  handleVotingRoundVote: (vote: string) => void
  pastProposals: EmergencyGovernancePastProposal[]
  selectedProposal: ProposalRecordType
  voteStatistics: VoteStatistics
  emergencyGovernanceLedger: EmergencyGovernanceLedgerType[]
}

export const EmergencyGovernanceView = ({
  ready,
  loading,
  accountPkh,
  emergencyGovernanceActive,
  glassBroken,
  handleVoteForEmergencyProposal,
  handleTriggerEmergencyProposal,
  pastProposals,
  handleProposalRoundVote,
  handleVotingRoundVote,
  selectedProposal,
  voteStatistics,
  emergencyGovernanceLedger,
}: Props) => {
  console.log('%c ||||| pastProposals', 'color:yellowgreen', pastProposals)
  console.log('%c ||||| emergencyGovernanceLedger', 'color:green', emergencyGovernanceLedger)
  const emergencyGovernanceCardActive = (
    <EmergencyGovernanceCard>
      <CardContent>
        <CardContentLeftSide>
          <h1>{selectedProposal.title}</h1>
          <b className="voting-ends">Voting ends in 13:31 hours</b>
          <p>{selectedProposal.description}</p>
        </CardContentLeftSide>
        <CardContentRightSide>
          <CardContentVoiting>
            <VotingArea
              ready={ready}
              loading={loading}
              accountPkh={accountPkh}
              handleProposalRoundVote={handleProposalRoundVote}
              handleVotingRoundVote={handleVotingRoundVote}
              selectedProposal={selectedProposal}
              voteStatistics={voteStatistics}
            />
          </CardContentVoiting>
        </CardContentRightSide>
      </CardContent>
    </EmergencyGovernanceCard>
  )

  return (
    <>
      <EmergencyGovernanceCard>
        <h1>What is it?</h1>
        <p>
          Handles the event of fatal flaw discovered → hold an emergency governance vote to pause all entrypoints in
          main contracts and pass access to the break glass contract where further actions will be determined by the
          break glass council members using a multi-sig.{' '}
          <FAQLink>
            <a
              href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
              target="_blank"
              rel="noreferrer"
            >
              Read documentation here.
            </a>
          </FAQLink>
        </p>
      </EmergencyGovernanceCard>

      {emergencyGovernanceActive && accountPkh ? (
        emergencyGovernanceCardActive
      ) : (
        <EmergencyGovernanceCard>
          <CardContent>
            <CardContentLeftSide>
              <h1>Trigger Emergency Governance Vote</h1>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make ...
              </p>
            </CardContentLeftSide>
            <CardContentRightSide>
              {accountPkh ? (
                <Button
                  text={'Trigger Vote'}
                  kind={ACTION_PRIMARY}
                  icon={'auction'}
                  onClick={handleTriggerEmergencyProposal}
                />
              ) : (
                <ConnectWallet className="connect-wallet" type={'main-menu'} />
              )}
            </CardContentRightSide>
          </CardContent>
        </EmergencyGovernanceCard>
      )}

      <EmergencyGovernHistory>
        <h1>Emergency Governance History</h1>
        {emergencyGovernanceLedger.map((emergencyGovernance, index) => {
          return <EGovHistoryCard emergencyGovernance={emergencyGovernance} />
        })}
      </EmergencyGovernHistory>
    </>
  )
}
