import React, { useState } from "react";

// components
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { CouncilPastActionView } from 'pages/Council/CouncilPastAction/CouncilPastAction.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

// styles
import { TabSwitcher } from './BreakGlassCouncil.style'

// types
import { BreakGlassAction } from "utils/TypesAndInterfaces/BreakGlass";

// helpers
import { BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

const tabsList: TabItem[] = [
  {
    text: 'My Ongoing Actions',
    id: 1,
    active: true,
  },
  {
    text: 'My Past Actions',
    id: 2,
    active: false,
  },
]

type Props = {
  paginatedMyPastCouncilActions: BreakGlassAction
  breakGlassCouncilMemberLength: number
  myPastBreakGlassCouncilActionLength: number
}

export function BreakGlassCouncilMyActions({
  paginatedMyPastCouncilActions,
  breakGlassCouncilMemberLength,
  myPastBreakGlassCouncilActionLength,
}: Props) {
  const [activeActionTab, setActiveActionTab] = useState('')

  const handleChangeTabs = (tabId?: number) => {
    setActiveActionTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }
  return (
    <>
      <TabSwitcher tabItems={tabsList} onClick={handleChangeTabs} />
      {(activeActionTab === tabsList[1].text) && (
        <>
          {paginatedMyPastCouncilActions.map((item) => (
            <CouncilPastActionView
              execution_datetime={String(item.executionDatetime)}
              key={item.id}
              action_type={item.actionType}
              signers_count={item.signersCount}
              num_council_members={breakGlassCouncilMemberLength}
              council_id={item.breakGlassId}
            />
          ))}

          <Pagination
            itemsCount={myPastBreakGlassCouncilActionLength}
            listName={BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME}
          />
        </>
      )}
    </>
  )
}
