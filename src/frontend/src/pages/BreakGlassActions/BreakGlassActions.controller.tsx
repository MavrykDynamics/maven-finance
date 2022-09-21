import React, { FC, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLocation } from 'react-router'

// components
import { ACTION_PRIMARY } from '../../app/App.components/Button/Button.constants'
import { Button } from '../../app/App.components/Button/Button.controller'
import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PastBreakGlassActionsCard } from './PastBreakGlassActionsCard/PastBreakGlassActionsCard.controller'
import { breakGlassActions } from './BreakGlassActions.actions'
import { BreakGlassActionsForm } from './BreakGlassActionsForms/BreakGlassActionsForm.controller'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

// helpers
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import {
  calculateSlicePositions,
  BREAK_GLASS_ACTIONS_LIST_NAME,
} from 'pages/FinacialRequests/Pagination/pagination.consts'

// actions
import { propagateBreakGlass } from './BreakGlassActions.actions'

// styles
import { Page } from 'styles'
import { PropagateBreakGlassCard, BreakGlassActionsCard, PastBreakGlassActions } from './BreakGlassActions.style'

// TODO: change mock to valid data
const mock = [
  {
    targetId: 'jfdasjklfklsakljf',
    initiatorId: 'dsafknkasdkfj',
    date: `${new Date()}`,
    executed: true,
    status: 1,
    id: 1,
    purpose: `Satellite tz1V...8HAJ has acted in good faith and wishes 
              to return to being an active part of governance following their usage 
              of inappropiate images as their satellite image`,
    governanceType: 'Set All Contracts Admin',
    linkAddress: 'fkdsnjkfnads',
    smvkPercentageForApproval: 1,
    yayVotesSmvkTotal: 233,
    nayVotesSmvkTotal: 342432,
    passVoteSmvkTotal: 4423,
    snapshotSmvkTotalSupply: 324,
  },
  {
    targetId: 'jfdasjklfklsakljf',
    initiatorId: 'dsafknkasdkfj',
    date: `${new Date()}`,
    executed: false,
    status: 2,
    id: 2,
    purpose: `Satellite tz1V...8HAJ has acted in good faith and wishes 
              to return to being an active part of governance following their usage 
              of inappropiate images as their satellite image`,
    governanceType: 'Set All Contracts Admin',
    linkAddress: 'fkdsnjkfnads',
    smvkPercentageForApproval: 1,
    yayVotesSmvkTotal: 32,
    nayVotesSmvkTotal: 34243232,
    passVoteSmvkTotal: 4423,
    snapshotSmvkTotalSupply: 324,
  },
  {
    targetId: 'jfdasjklfklsakljf',
    initiatorId: 'dsafknkasdkfj',
    date: `${new Date()}`,
    executed: true,
    status: 3,
    id: 3,
    purpose: `Satellite tz1V...8HAJ has acted in good faith and wishes 
              to return to being an active part of governance following their usage 
              of inappropiate images as their satellite image`,
    governanceType: 'Set All Contracts Admin',
    linkAddress: 'fkdsnjkfnads',
    smvkPercentageForApproval: 1,
    yayVotesSmvkTotal: 233,
    nayVotesSmvkTotal: 342,
    passVoteSmvkTotal: 23,
    snapshotSmvkTotalSupply: 324,
  },
]

const actionNameHandler = (name: string) => {
  return name
    .split('_')
    .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
    .join(' ')
}

export const BreakGlassActions: FC = () => {
  const dispatch = useDispatch()
  const { search } = useLocation()
  const { breakGlassAction } = useSelector((state: State) => state.breakGlass)
  const currentPage = getPageNumber(search, BREAK_GLASS_ACTIONS_LIST_NAME)

  const itemsForDropDown = useMemo(
    () => [
      ...Object.values(breakGlassActions).map((item) => {
        return {
          text: actionNameHandler(item),
          value: item,
        }
      }),
    ],
    [],
  )

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>(itemsForDropDown[0])

  const handleClickPropagateBreakGlass = () => {
    dispatch(propagateBreakGlass())
  }

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
  }

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_ACTIONS_LIST_NAME)
    return mock?.slice(from, to)
  }, [currentPage, mock])

  return (
    <Page>
      <PageHeader page={'break glass actions'} />

      <PropagateBreakGlassCard>
        <h1>Propagate Break Glass</h1>

        <Button
          className="start_verification"
          text="Propagate Break Glass"
          kind={ACTION_PRIMARY}
          icon={'plus'}
          onClick={handleClickPropagateBreakGlass}
        />
      </PropagateBreakGlassCard>

      <BreakGlassActionsCard>
        <div className="top-bar">
          <h1 className="top-bar-title">Break Glass Actions</h1>

          <div className="dropdown-size">
            <DropDown
              clickOnDropDown={handleClickDropdown}
              placeholder={ddItems[0]}
              isOpen={ddIsOpen}
              itemSelected={chosenDdItem?.text}
              items={ddItems}
              clickOnItem={(e) => handleClickDropdownItem(e)}
            />
          </div>
        </div>

        <BreakGlassActionsForm action={chosenDdItem?.value} />
      </BreakGlassActionsCard>

      <PastBreakGlassActions>
        <h1>Past Break Glass Actions</h1>

        {paginatedItemsList.map((item) => {
          return <PastBreakGlassActionsCard key={item.id} {...item}  />
        })}

        <Pagination itemsCount={mock?.length} listName={BREAK_GLASS_ACTIONS_LIST_NAME} />
      </PastBreakGlassActions>
    </Page>
  )
}
