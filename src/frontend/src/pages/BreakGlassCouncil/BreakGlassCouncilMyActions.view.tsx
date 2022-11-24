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
import { CouncilActions } from "utils/TypesAndInterfaces/Council";

type Props = {
  myPastBreakGlassCouncilAction: BreakGlassAction | CouncilActions
  myPastBreakGlassCouncilActionLength: number
  breakGlassActionPendingMySignature: BreakGlassAction | CouncilActions
  breakGlassActionPendingMySignatureLength: number
  numCouncilMembers: number
  activeActionTab: string
  setActiveActionTab: (arg: string) => void
  tabsList: TabItem[]
  handleDropAction: (arg: number) => void
  listNameMyPastActions: string
  listNameMyOngoingActions: string
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
  listNameMyPastActions,
  listNameMyOngoingActions,
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
              // @ts-ignore TODO: handle string
              councilId={item?.breakGlassId || item?.councilId}
            />
          ))}

          <Pagination
            itemsCount={myPastBreakGlassCouncilActionLength}
            listName={listNameMyPastActions}
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
            listName={listNameMyOngoingActions}
          />
        </>
      )}
    </>
  )
}
