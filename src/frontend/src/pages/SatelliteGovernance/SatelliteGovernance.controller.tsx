import React, { useState } from 'react'
import { Page } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import Icon from '../../app/App.components/Icon/Icon.view'
import { DropDown } from '../../app/App.components/DropDown/DropDown.controller'
import { Input } from '../../app/App.components/Input/Input.controller'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'
import { Button } from '../../app/App.components/Button/Button.controller'
import { SlidingTabButtons } from '../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { SatelliteGovernanceCard } from './SatelliteGovernanceCard/SatelliteGovernanceCard.controller'
import { SatelliteGovernanceForm } from './SatelliteGovernance.form'

// style
import { SatelliteGovernanceStyled, AvailableActionsStyle } from './SatelliteGovernance.style'
import { DropdownWrap, DropdownCard } from '../../app/App.components/DropDown/DropDown.style'

export const SatelliteGovernance = () => {
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const itemsForDropDown = [
    { text: 'Chose action', value: '' },
    { text: 'Suspend Satellite', value: 'suspendSatellite' },
    { text: 'Unsuspend Satellite', value: 'unsuspendSatellite' },
    { text: 'Ban Satellite', value: 'banSatellite' },
    { text: 'Unban Satellite', value: 'unbanSatellite' },
    { text: 'Remove Oracles', value: 'removeOracles' },
    { text: 'Remove from Aggregator', value: 'removeFromAggregator' },
    { text: 'Add to Aggregator', value: 'addToAggregator' },
  ]

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {
    console.log('%c ||||| item', 'color:yellowgreen', item)
  }

  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  return (
    <Page>
      <PageHeader page={'satellite-governance'} kind={PRIMARY} />
      <SatelliteGovernanceStyled>
        <article className="satellite-governance-article">
          <div className="satellite-governance-info">
            <h3>Total Active Satellites</h3>
            <p>
              350{' '}
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
              920+{' '}
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
              2,300,000,000+{' '}
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
              350{' '}
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

        <SlidingTabButtons className="tab-buttons" onClick={() => null} type={'GovProposalSubmissionForm'} />
      </SatelliteGovernanceStyled>
      <SatelliteGovernanceCard
        satelliteGovernanceCard={{
          id: 0,
          title: 'Suspend Satellite',
          startTimestamp: 'string',
          proposerId: 'KT1GqPZTDFbv3VnLATFZNh87YWk8iarg2Xqm',
          description:
            'Satellite tz1V...8HAJ has acted in good faith and wishes to return to being an active part of governance following their usage of inappropiate images as their satellite image',
          dropped: false,
          executed: true,
        }}
      />
      <SatelliteGovernanceCard
        satelliteGovernanceCard={{
          id: 0,
          title: 'Suspend Satellite',
          startTimestamp: 'string',
          proposerId: 'KT1GqPZTDFbv3VnLATFZNh87YWk8iarg2Xqm',
          description:
            'Satellite tz1V...8HAJ has acted in good faith and wishes to return to being an active part of governance following their usage of inappropiate images as their satellite image',
          dropped: false,
          executed: true,
        }}
      />
      <SatelliteGovernanceCard
        satelliteGovernanceCard={{
          id: 0,
          title: 'Suspend Satellite',
          startTimestamp: 'string',
          proposerId: 'KT1GqPZTDFbv3VnLATFZNh87YWk8iarg2Xqm',
          description:
            'Satellite tz1V...8HAJ has acted in good faith and wishes to return to being an active part of governance following their usage of inappropiate images as their satellite image',
          dropped: false,
          executed: true,
        }}
      />
    </Page>
  )
}

export default SatelliteGovernance
