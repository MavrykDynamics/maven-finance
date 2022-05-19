import * as React from 'react'
import { FAQLink } from '../Satellites/SatelliteSideBar/SatelliteSideBar.style'
import { ConnectWallet } from '../../app/App.components/ConnectWallet/ConnectWallet.controller'
import { Button } from '../../app/App.components/Button/Button.controller'
import { EmergencyGovernancePastProposal } from './mockEGovProposals'
import { EGovHistoryCard } from './EGovHistoryCard/EGovHistoryCard.controller'
import {
  EmergencyGovernanceCard,
  CardContentLeftSide,
  CardContentRightSide,
  EmergencyGovernHistory,
  CardContent,
} from './EmergencyGovernance.style'

type BreakGlassViewProps = {
  loading: boolean
  accountPkh?: any
  emergencyGovernanceActive: boolean
  glassBroken: boolean
  handleVoteForEmergencyProposal: () => void
  handleTriggerEmergencyProposal: () => void
  pastProposals: EmergencyGovernancePastProposal[]
}

export const EmergencyGovernanceView = ({
  loading,
  accountPkh,
  emergencyGovernanceActive,
  glassBroken,
  handleVoteForEmergencyProposal,
  handleTriggerEmergencyProposal,
  pastProposals,
}: BreakGlassViewProps) => {
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
      <EmergencyGovernanceCard>
        {emergencyGovernanceActive ? (
          <h1>Emergency Governance Active</h1>
        ) : (
          <CardContent>
            <CardContentLeftSide>
              <h1>Trigger Emergency Governance Vote</h1>
              <p>Content here about what triggering a vote does the consequences of doing so</p>
            </CardContentLeftSide>
            <CardContentRightSide>
              {accountPkh ? (
                <Button text={'Trigger Vote'} icon={'hammer'} onClick={handleTriggerEmergencyProposal} />
              ) : (
                <ConnectWallet type={'main-menu'} />
              )}
            </CardContentRightSide>
          </CardContent>
        )}
      </EmergencyGovernanceCard>
      <EmergencyGovernHistory>
        <h1>Emergency Governance History</h1>
        {pastProposals.map((proposal, index) => {
          return <EGovHistoryCard pastProposal={proposal} />
        })}
      </EmergencyGovernHistory>
    </>
  )
}
