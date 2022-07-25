import React, { useEffect, useMemo, useState } from 'react'
import { Page } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLocation } from 'react-router'

// types
import type { GovernanceSatelliteItem } from '../../reducers/governance'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import {
  calculateSlicePositions,
  getSatelliteGovernanceListName,
} from 'pages/FinacialRequests/Pagination/pagination.consts'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import Icon from '../../app/App.components/Icon/Icon.view'
import { DropDown } from '../../app/App.components/DropDown/DropDown.controller'
import {
  ButtonStyled,
  ButtonText,
  SlidingTabButtonsStyled,
} from '../../app/App.components/SlidingTabButtons/SlidingTabButtons.style'
import { SatelliteGovernanceCard } from './SatelliteGovernanceCard/SatelliteGovernanceCard.controller'
import { SatelliteGovernanceForm } from './SatelliteGovernance.form'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

// actions
import { getGovernanceSatelliteStorage } from './SatelliteGovernance.actions'
import { getTotalDelegatedMVK } from 'pages/Satellites/helpers/Satellites.consts'

// style
import { SatelliteGovernanceStyled } from './SatelliteGovernance.style'
import { DropdownCard, DropdownWrap } from '../../app/App.components/DropDown/DropDown.style'
import { SatelliteStatus } from '../../utils/TypesAndInterfaces/Delegation'

const itemsForDropDown = [
  { text: 'Choose action', value: '' },
  { text: 'Suspend Satellite', value: 'suspendSatellite' },
  { text: 'Unsuspend Satellite', value: 'unsuspendSatellite' },
  { text: 'Ban Satellite', value: 'banSatellite' },
  { text: 'Unban Satellite', value: 'unbanSatellite' },
  { text: 'Remove Oracles', value: 'removeOracles' },
  { text: 'Remove from Aggregator', value: 'removeFromAggregator' },
  { text: 'Add to Aggregator', value: 'addToAggregator' },
]

const getOngoingActionsList = (list: GovernanceSatelliteItem): GovernanceSatelliteItem => {
  return list.filter((item: any) => {
    const timeNow = Date.now()
    const expirationDatetime = new Date(item.expiration_datetime).getTime()
    return expirationDatetime > timeNow && item.status !== 1 && !item.executed
  })
}

const getPastActionsList = (list: GovernanceSatelliteItem): GovernanceSatelliteItem => {
  console.log(list)
  return list.filter((item: any) => {
    const timeNow = Date.now()
    const expirationDatetime = new Date(item.expiration_datetime).getTime()
    return expirationDatetime < timeNow || item.status === 0
  })
}

export const SatelliteGovernance = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const { governanceSatelliteStorage } = useSelector((state: State) => state.governance)
  const satelliteLedger = delegationStorage?.satelliteLedger
  const { totalOracleNetworks } = oraclesStorage
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)
  const satelliteLedgerActive = useMemo(
    () => satelliteLedger.filter((item) => item.status === SatelliteStatus.ACTIVE),
    [satelliteLedger],
  )

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])
  const [activeTab, setActiveTab] = useState('ongoing')
  const governanceSatelliteActionRecord = governanceSatelliteStorage.governance_satellite_action_record

  const ongoingActionsAmount = getOngoingActionsList(governanceSatelliteActionRecord).length

  const [separateRecord, setSeparateRecord] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    const filterOngoing = getOngoingActionsList(governanceSatelliteActionRecord)
    const filterPast = getPastActionsList(governanceSatelliteActionRecord)
    setSeparateRecord(filterOngoing.length ? filterOngoing : filterPast)
    setActiveTab(filterOngoing.length ? 'ongoing' : 'past')
  }, [governanceSatelliteActionRecord])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {}

  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  const handleTabChange = (tabId: string) => {
    if (tabId === 'ongoing') {
      setActiveTab('ongoing')
      const filterOngoing = getOngoingActionsList(governanceSatelliteActionRecord)

      setSeparateRecord(filterOngoing)
    }

    if (tabId === 'past') {
      setActiveTab('past')
      const filterPast = getPastActionsList(governanceSatelliteActionRecord)
      setSeparateRecord(filterPast)
    }

    if (tabId === 'my') {
      setActiveTab('my')
      const filterPast = governanceSatelliteActionRecord.filter((item: any) => {
        return accountPkh === item.initiator_id
      })
      setSeparateRecord(filterPast)
    }
  }

  useEffect(() => {
    dispatch(getGovernanceSatelliteStorage())
  }, [dispatch])

  const listName = useMemo(() => getSatelliteGovernanceListName(activeTab), [activeTab])
  const { pathname, search } = useLocation()
  const currentPage = getPageNumber(search, listName)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return separateRecord.slice(from, to)
  }, [currentPage, separateRecord])

  return (
    <Page>
      <PageHeader page={'satellite-governance'} kind={PRIMARY} />
      <SatelliteGovernanceStyled>
        <article className="satellite-governance-article">
          <div className="satellite-governance-info">
            <h3>Total Active Satellites</h3>
            <p>
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
            <p>
              {totalOracleNetworks}{' '}
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
            <p>
              <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />{' '}
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
            <h3>Ongoing Actions</h3>
            <p>
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
                placeholder={ddItems[0]}
                onChange={handleSelect}
                isOpen={ddIsOpen}
                itemSelected={chosenDdItem?.text}
                items={ddItems}
                onBlur={() => {}}
                clickOnItem={(e) => handleOnClickDropdownItem(e)}
              />
            </DropdownWrap>
            <SatelliteGovernanceForm variant={chosenDdItem?.value || ''} />
          </DropdownCard>
        ) : null}

        <SlidingTabButtonsStyled className="tab-buttons">
          <ButtonStyled buttonActive={activeTab === 'ongoing'} onClick={() => handleTabChange('ongoing')}>
            <ButtonText>Ongoing Actions</ButtonText>
          </ButtonStyled>
          <ButtonStyled buttonActive={activeTab === 'past'} onClick={() => handleTabChange('past')}>
            <ButtonText>Past Actions</ButtonText>
          </ButtonStyled>
          {accountPkh ? (
            <ButtonStyled buttonActive={activeTab === 'my'} onClick={() => handleTabChange('my')}>
              <ButtonText>My Actions</ButtonText>
            </ButtonStyled>
          ) : null}
        </SlidingTabButtonsStyled>
      </SatelliteGovernanceStyled>

      {paginatedItemsList.map((item: any) => {
        const linkAddress = item.governance_satellite_action_parameters?.[0]?.value || ''

        return (
          <SatelliteGovernanceCard
            key={item.id}
            id={item.id}
            satelliteId={item.linkAddress || item.initiator_id}
            date={item.expiration_datetime}
            executed={item.executed}
            status={item.status}
            purpose={item.governance_purpose}
            governanceType={item.governance_type}
            linkAddress={linkAddress}
            yayVotesSmvkTotal={item.yay_vote_smvk_total}
            nayVotesSmvkTotal={item.nay_vote_smvk_total}
            snapshotSmvkTotalSupply={item.snapshot_smvk_total_supply}
            passVoteSmvkTotal={item.pass_vote_smvk_total}
            smvkPercentageForApproval={item.smvk_percentage_for_approval}
          />
        )
      })}

      <Pagination itemsCount={separateRecord.length} listName={listName} />
    </Page>
  )
}

export default SatelliteGovernance
