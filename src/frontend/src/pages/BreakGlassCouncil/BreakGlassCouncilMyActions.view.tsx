import React from "react";
import { BreakGlassCouncilMyOngoingActionCard } from "./BreakGlassCouncilMyOngoingActionCard.view";

// components
import { CouncilPastActionView } from 'pages/Council/CouncilPastAction/CouncilPastAction.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

// styles
import { TabSwitcher } from './BreakGlassCouncil.style'

// types
import { BreakGlassAction } from "utils/TypesAndInterfaces/BreakGlass";
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// helpers
import { BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME, BREAK_GLASS_MY_ONGOING_ACTIONS_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

type Props = {
  myPastBreakGlassCouncilAction: BreakGlassAction
  myPastBreakGlassCouncilActionLength: number
  breakGlassActionPendingMySignature: BreakGlassAction
  breakGlassActionPendingMySignatureLength: number
  numCouncilMembers: number
  activeActionTab: string
  setActiveActionTab: (arg: string) => void
  tabsList: TabItem[]
  handleDropAction: (arg: number) => void
}

export function BreakGlassCouncilMyActions({
  myPastBreakGlassCouncilAction,
  myPastBreakGlassCouncilActionLength,
  breakGlassActionPendingMySignature,
  breakGlassActionPendingMySignatureLength,
  numCouncilMembers,
  activeActionTab,
  setActiveActionTab,
  tabsList,
  handleDropAction,
}: Props) {
    const handleChangeTabs = (tabId?: number) => {
    setActiveActionTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }
  return (
    <>
      <TabSwitcher tabItems={tabsList} onClick={handleChangeTabs} />
      {(activeActionTab === tabsList[1].text) && (
        <>
          {myPastBreakGlassCouncilAction.map((item) => (
            <CouncilPastActionView
              executionDatetime={String(item.executionDatetime)}
              key={item.id}
              actionType={item.actionType}
              signersCount={item.signersCount}
              numCouncilMembers={numCouncilMembers}
              councilId={item.breakGlassId}
            />
          ))}

          <Pagination
            itemsCount={myPastBreakGlassCouncilActionLength}
            listName={BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME}
          />
        </>
      )}

      {(activeActionTab === tabsList[0].text) && (
        <>
          {breakGlassActionPendingMySignature.map((item) => (
            <BreakGlassCouncilMyOngoingActionCard
              {...item}
              key={String(item.id)}
              numCouncilMembers={numCouncilMembers}
              handleDropAction={handleDropAction}
            />
          ))}

          <Pagination
            itemsCount={breakGlassActionPendingMySignatureLength}
            listName={BREAK_GLASS_MY_ONGOING_ACTIONS_LIST_NAME}
          />
        </>
      )}
    </>
  )
}
