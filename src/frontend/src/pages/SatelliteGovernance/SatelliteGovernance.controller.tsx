import React, { useEffect, useMemo, useState } from 'react'
import { Page } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLocation } from 'react-router'

// types
import type { GovernanceSatelliteActionGraphQL } from '../../utils/TypesAndInterfaces/Governance'

// const
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import {
  calculateSlicePositions,
  getSatelliteGovernanceListName,
} from 'pages/FinacialRequests/Pagination/pagination.consts'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import Icon from '../../app/App.components/Icon/Icon.view'
import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { FixMistakenTransferForm } from './FixMistakenTransfer.form'
import { SatelliteGovernanceCard } from './SatelliteGovernanceCard/SatelliteGovernanceCard.controller'
import { SatelliteGovernanceForm } from './SatelliteGovernance.form'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { checkIfUserIsSatellite } from 'pages/Satellites/helpers/Satellites.consts'
import { SlidingTabButtons, TabItem } from '../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { RegisterAggregatorForm } from './RegisterAggregator.form'

// actions
import { getGovernanceSatelliteStorage } from './SatelliteGovernance.actions'
import { getTotalDelegatedMVK } from 'pages/Satellites/helpers/Satellites.consts'

// style
import { SatelliteGovernanceStyled, SlidingTabButtonsWrap } from './SatelliteGovernance.style'
import { DropdownCard, DropdownWrap } from '../../app/App.components/DropDown/DropDown.style'
import { SatelliteStatus } from '../../utils/TypesAndInterfaces/Delegation'
import { EmptyContainer } from '../../app/App.style'

const itemsForDropDown = [
  { text: 'Suspend Satellite', value: 'suspendSatellite' },
  { text: 'Unsuspend Satellite', value: 'unsuspendSatellite' },
  { text: 'Ban Satellite', value: 'banSatellite' },
  { text: 'Unban Satellite', value: 'unbanSatellite' },
  { text: 'Remove Oracles', value: 'removeOracles' },
  { text: 'Remove from Aggregator', value: 'removeFromAggregator' },
  { text: 'Add to Aggregator', value: 'addToAggregator' },
  { text: 'Restore Satellite', value: 'restoreSatellite' },
  { text: 'Set Aggregator Maintainer', value: 'setAggregatorMaintainer' },
  { text: 'Update Aggregator Status', value: 'updateAggregatorStatus' },
  { text: 'Register Aggregator', value: 'registerAggregator' },
  { text: 'Fix Mistaken Transfer', value: 'fixMistakenTransfer' },
]

const getOngoingActionsList = (list: GovernanceSatelliteActionGraphQL[]): GovernanceSatelliteActionGraphQL[] => {
  return list?.filter((item) => {
    const timeNow = Date.now()
    const expirationDatetime = new Date(item.expiration_datetime as string).getTime()
    return expirationDatetime > timeNow && item.status !== 1 && !item.executed
  })
}

const getPastActionsList = (list: GovernanceSatelliteActionGraphQL[]): GovernanceSatelliteActionGraphQL[] => {
  return list?.filter((item) => {
    const timeNow = Date.now()
    const expirationDatetime = new Date(item.expiration_datetime as string).getTime()
    return expirationDatetime < timeNow || item.status === 0
  })
}

export const SatelliteGovernance = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    delegationStorage: { satelliteLedger, oraclesAmount },
  } = useSelector((state: State) => state.delegation)
  const { governanceSatelliteStorage } = useSelector((state: State) => state.governance)
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)
  const satelliteLedgerActive = useMemo(
    () => satelliteLedger.filter((item) => item.status === SatelliteStatus.ACTIVE),
    [satelliteLedger],
  )

  const userIsSatellite = checkIfUserIsSatellite(accountPkh, satelliteLedger)

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()
  const [activeTab, setActiveTab] = useState('ongoing')
  const governanceSatelliteActionRecord = governanceSatelliteStorage?.governance_satellite_action

  const ongoingActionsAmount = getOngoingActionsList(governanceSatelliteActionRecord)?.length

  const [separateRecord, setSeparateRecord] = useState<GovernanceSatelliteActionGraphQL[]>([])

  const [tabsList, setTabsList] = useState<TabItem[]>([])
  const maxLength = {
    purposeMaxLength: governanceSatelliteStorage.governance_satellite[0]?.gov_purpose_max_length
  }

  useEffect(() => {
    const filterOngoing = getOngoingActionsList(governanceSatelliteActionRecord)

    const filterPast = getPastActionsList(governanceSatelliteActionRecord)

    setSeparateRecord(filterOngoing?.length ? filterOngoing : filterPast)
    setActiveTab(filterOngoing?.length ? 'ongoing' : 'past')

    const prevTabs = [
      { text: 'Ongoing Actions', id: 1, active: Boolean(filterOngoing?.length) },
      { text: 'Past Actions', id: 2, active: Boolean(!filterOngoing?.length) },
    ]

    if (userIsSatellite) {
      setTabsList([...prevTabs, { text: 'My Actions', id: 3, active: false }])
    } else {
      setTabsList([...prevTabs])
    }
  }, [governanceSatelliteActionRecord, userIsSatellite])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
  }

  const handleChangeTabs = (tabId?: number) => {
    if (tabId === 1) {
      setActiveTab('ongoing')
      const filterOngoing = getOngoingActionsList(governanceSatelliteActionRecord)

      setSeparateRecord(filterOngoing)
    }

    if (tabId === 2) {
      setActiveTab('past')
      const filterPast = getPastActionsList(governanceSatelliteActionRecord)
      setSeparateRecord(filterPast)
    }

    if (tabId === 3) {
      setActiveTab('my')
      const filterPast = governanceSatelliteActionRecord.filter((item) => {
        return accountPkh === item.initiator_id
      })
      setSeparateRecord(filterPast)
    }
  }

  useEffect(() => {
    dispatch(getGovernanceSatelliteStorage())
  }, [dispatch])

  const listName = useMemo(() => getSatelliteGovernanceListName(activeTab), [activeTab])
  const { search } = useLocation()
  const currentPage = getPageNumber(search, listName)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return separateRecord?.slice(from, to)
  }, [currentPage, separateRecord])

  const emptyContainer = (
    <EmptyContainer>
      <img src="/images/not-found.svg" alt=" No proposals to show" />
      <figcaption> No actions to show</figcaption>
    </EmptyContainer>
  )

  return (
    <Page>
      <PageHeader page={'satellite-governance'} />
      <SatelliteGovernanceStyled>
        <article className="satellite-governance-article">
          <div className="satellite-governance-info">
            <h3>Total Active Satellites</h3>
            <p className="info-content">
              {satelliteLedgerActive?.length}{' '}
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
            </p>
          </div>
          <div className="satellite-governance-info">
            <h3>Total Oracle Networks</h3>
            <p className="info-content">
              {oraclesAmount}{' '}
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
            </p>
          </div>
          <div className="satellite-governance-info">
            <h3>Total Delegated MVK</h3>
            <div className="info-content">
              <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />{' '}
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
            </div>
          </div>
          <div className="satellite-governance-info">
            <h3>Ongoing Actions</h3>
            <p className="info-content">
              {ongoingActionsAmount}{' '}
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
            </p>
          </div>
        </article>
        {accountPkh ? (
          <DropdownCard className="satellite-governance-dropdown">
            <DropdownWrap>
              <h2>Available Actions</h2>
              <DropDown
                clickOnDropDown={handleClickDropdown}
                placeholder='Choose action'
                isOpen={ddIsOpen}
                setIsOpen={setDdIsOpen}
                itemSelected={chosenDdItem?.text}
                items={ddItems}
                clickOnItem={(e) => handleOnClickDropdownItem(e)}
              />
            </DropdownWrap>
            {chosenDdItem?.value === 'registerAggregator' ? (
              <RegisterAggregatorForm />
            ) : chosenDdItem?.value === 'fixMistakenTransfer' ? (
              <FixMistakenTransferForm />
            ) : (
              <SatelliteGovernanceForm maxLength={maxLength} variant={chosenDdItem?.value || ''} />
            )}
          </DropdownCard>
        ) : null}
        <SlidingTabButtonsWrap>
          {tabsList?.length ? <SlidingTabButtons tabItems={tabsList} onClick={handleChangeTabs} /> : null}
        </SlidingTabButtonsWrap>
      </SatelliteGovernanceStyled>

      {paginatedItemsList?.length
        ? paginatedItemsList.map((item: GovernanceSatelliteActionGraphQL) => {          
            return (
              <SatelliteGovernanceCard
                key={item.id}
                id={item.id}
                satelliteId={item.governance_satellite_id}
                initiatorId={item.initiator_id}
                date={item.expiration_datetime || ''}
                executed={item.executed}
                status={item.status}
                purpose={item.governance_purpose}
                governanceType={item.governance_type}
                yayVotesSmvkTotal={item.yay_vote_smvk_total}
                nayVotesSmvkTotal={item.nay_vote_smvk_total}
                snapshotSmvkTotalSupply={item.snapshot_smvk_total_supply}
                passVoteSmvkTotal={item.pass_vote_smvk_total}
                smvkPercentageForApproval={item.smvk_percentage_for_approval}
                accountPkh={accountPkh}
              />
            )
          })
        : emptyContainer}

      <Pagination itemsCount={separateRecord?.length} listName={listName} />
    </Page>
  )
}

export default SatelliteGovernance
