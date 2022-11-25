import React from "react";
import { CouncilOngoingAction } from "./CouncilOngoingAction.view";

// components
import { CouncilPastActionView } from 'pages/Council/CouncilPastAction/CouncilPastAction.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'

// styles
import { TabSwitcher } from './Council.style'

// types
import { BreakGlassActions } from "utils/TypesAndInterfaces/BreakGlass";
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { CouncilActions } from "utils/TypesAndInterfaces/Council";

type Props = {
  myPastCouncilAction: BreakGlassActions | CouncilActions
  myPastCouncilActionLength: number
  actionPendingSignature: BreakGlassActions | CouncilActions
  actionPendingSignatureLength: number
  numCouncilMembers: number
  activeActionTab: string
  setActiveActionTab: (arg: string) => void
  tabsList: TabItem[]
  handleDropAction: (arg: number) => void
  listNameMyPastActions: string
  listNameMyOngoingActions: string
}

export function MyCouncilActions({
  myPastCouncilAction,
  myPastCouncilActionLength,
  actionPendingSignature,
  actionPendingSignatureLength,
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
          {myPastCouncilAction.map((item) => (
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
            itemsCount={myPastCouncilActionLength}
            listName={listNameMyPastActions}
          />
        </>
      )}

      {(activeActionTab === tabsList[0].text) && (
        <>
          {actionPendingSignature.map((item) => (
            <CouncilOngoingAction
              {...item}
              key={String(item.id)}
              numCouncilMembers={numCouncilMembers}
              handleDropAction={handleDropAction}
            />
          ))}

          <Pagination
            itemsCount={actionPendingSignatureLength}
            listName={listNameMyOngoingActions}
          />
        </>
      )}
    </>
  )
}
