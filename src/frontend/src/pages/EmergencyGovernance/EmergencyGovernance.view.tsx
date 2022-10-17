import { useMemo, useState } from 'react'

// actions, consts
import {
  calculateSlicePositions,
  EMERGENCY_GOVERNANCE_LIST_NAME,
} from 'pages/FinacialRequests/Pagination/pagination.consts'

// types
import type {
  EmergencyGovernanceStorage,
  EmergergencyGovernanceItem,
} from '../../utils/TypesAndInterfaces/EmergencyGovernance'

// components
import Icon from '../../app/App.components/Icon/Icon.view'

import { ACTION_PRIMARY } from '../../app/App.components/Button/Button.constants'
import { Button } from '../../app/App.components/Button/Button.controller'
import { ConnectWallet } from '../../app/App.components/ConnectWallet/ConnectWallet.controller'
import { FAQLink } from '../Satellites/SatellitesSideBar/SatelliteSideBar.style'
import { EGovHistoryCard } from './EGovHistoryCard/EGovHistoryCard.controller'
import {
  CardContent,
  CardContentLeftSide,
  CardContentRightSide,
  EmergencyGovernanceCard,
  EmergencyGovernHistory,
} from './EmergencyGovernance.style'

import { VoteStatistics } from '../Governance/Governance.controller'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { useLocation } from 'react-router'

type Props = {
  accountPkh?: string
  handleTriggerEmergencyProposal: () => void
  emergencyGovernanceLedger: EmergencyGovernanceStorage['emergencyGovernanceLedger']
}

export const EmergencyGovernanceView = ({
  accountPkh,
  handleTriggerEmergencyProposal,
  emergencyGovernanceLedger,
}: Props) => {
  const { historyItems, activeItems } = useMemo(
    () =>
      emergencyGovernanceLedger.reduce<{
        historyItems: Array<EmergergencyGovernanceItem>
        activeItems: Array<EmergergencyGovernanceItem>
      }>(
        (acc, eGovItem) => {
          const isExecutedDateTime = new Date(eGovItem.expirationTimestamp).getTime() < Date.now()
          if (isExecutedDateTime || eGovItem.executed || eGovItem.dropped) {
            acc.historyItems.push(eGovItem)
          } else {
            acc.activeItems.push(eGovItem)
          }
          return acc
        },
        { historyItems: [], activeItems: [] },
      ),
    [emergencyGovernanceLedger],
  )

  const { search } = useLocation()
  const currentPage = getPageNumber(search, EMERGENCY_GOVERNANCE_LIST_NAME)

  const paginatedItemsListHistory = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, EMERGENCY_GOVERNANCE_LIST_NAME)
    return historyItems.slice(from, to)
  }, [currentPage, historyItems])

  return (
    <>
      <EmergencyGovernanceCard>
        <h1>What is it?</h1>
        <div className="inner">
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
        </div>
      </EmergencyGovernanceCard>

      <EmergencyGovernanceCard>
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
        <CardContent>
          <CardContentLeftSide>
            <h1>Trigger Emergency Governance Vote</h1>
            <p className="inner">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make ...
            </p>
          </CardContentLeftSide>
          <CardContentRightSide>
            {accountPkh ? (
              <Button
                text={'Initiate'}
                kind={ACTION_PRIMARY}
                icon={'auction'}
                onClick={handleTriggerEmergencyProposal}
              />
            ) : (
              <ConnectWallet className="connect-wallet" />
            )}
          </CardContentRightSide>
        </CardContent>
      </EmergencyGovernanceCard>

      <EmergencyGovernHistory>
        <h1>Emergency Governance Active Proposals</h1>
        {activeItems.map((emergencyGovernance) => {
          return <EGovHistoryCard key={emergencyGovernance.id} emergencyGovernance={emergencyGovernance} />
        })}

        <Pagination itemsCount={emergencyGovernanceLedger.length} listName={EMERGENCY_GOVERNANCE_LIST_NAME} />
      </EmergencyGovernHistory>

      <EmergencyGovernHistory>
        <h1>Emergency Governance History</h1>
        {paginatedItemsListHistory.map((emergencyGovernance) => {
          return <EGovHistoryCard key={emergencyGovernance.id} emergencyGovernance={emergencyGovernance} />
        })}

        <Pagination itemsCount={emergencyGovernanceLedger.length} listName={EMERGENCY_GOVERNANCE_LIST_NAME} />
      </EmergencyGovernHistory>
    </>
  )
}
