import React, { FC, useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLocation } from 'react-router'

// components
import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { CouncilPastActionView } from 'pages/Council/CouncilPastAction/CouncilPastAction.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { CouncilPendingView } from '../Council/CouncilPending/CouncilPending.view'
import { CouncilMemberView } from 'pages/Council/CouncilMember/CouncilMember.view'
import Icon from '../../app/App.components/Icon/Icon.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { BreakGlassCouncilForm, actions } from './BreakGlassCouncilForms/BreakGlassCouncilForm.controller'
import { FormUpdateCouncilMemberView } from './BreakGlassCouncilForms/FormUpdateCouncilMember.view'

// helpers
import { ACTION_SECONDARY } from '../../app/App.components/Button/Button.constants'
import { 
  BREAK_GLASS_PAST_COUNCIL_ACTIONS_LIST_NAME, 
  BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME,
  calculateSlicePositions,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { ACTION_PRIMARY } from '../../app/App.components/Button/Button.constants'

// styles
import { Page, BreakGlassCouncilStyled, ReviewPastCouncilActionsCard, GoBack, AvaliableActions, ModalPopup, PropagateBreakGlassCouncilCard } from './BreakGlassCouncil.style'

// actions
import { propagateBreakGlass } from './BreakGlassCouncil.actions'

// TODO: change mock to valid data

const mockHistory = [
  {
    execution_datetime: `${new Date()}`,
    id: 1,
    action_type: 'Change Council Member',
    signers_count: 4,
    num_council_members: 2,
    council_id: '6',
  },
  {
    execution_datetime: `${new Date()}`,
    id: 3,
    action_type: 'Change Council Member',
    signers_count: 4,
    num_council_members: 2,
    council_id: '4',
  },
  {
    execution_datetime: `${new Date()}`,
    id: 2,
    action_type: 'Change Council Member',
    signers_count: 4,
    num_council_members: 2,
    council_id: '1',
  },
]

const actionNameHandler = (name: string) => {
  return name
    .split('_')
    .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
    .join(' ')
}

export const BreakGlassCouncil: FC = () => {
  const dispatch = useDispatch()
  const { search } = useLocation()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    breakGlassCouncilMember,
    pastBreakGlassCouncilAction,
    breakGlassActionPendingMySignature,
  } = useSelector((state: State) => state.breakGlass)
  
  const itemsForDropDown = useMemo(
    () => [
      ...Object.values(actions).map((item) => {
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

  const [isGoBack, setIsGoBack] = useState(false)
  const [sliderKey, setSliderKey] = useState(1)
  const [isPendingSignature, setIsPendingSignature] = useState(true)
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const isUserInBreakCouncilMember = Boolean(breakGlassCouncilMember.find((item) => item.userId === accountPkh)?.id)
  const displayPendingSignature = Boolean(isPendingSignature && isUserInBreakCouncilMember && breakGlassActionPendingMySignature?.length)

  const handleOpenleModal = () => {
    setIsUpdateCouncilMemberInfo(true)
  }

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
  }

  const currentPage = getPageNumber(
    search, isGoBack ? BREAK_GLASS_PAST_COUNCIL_ACTIONS_LIST_NAME : BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME
  )

  const paginatedMyPastCouncilActions= useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME)
    return mockHistory?.slice(from, to)
  }, [currentPage, mockHistory])

  const paginatedPastBreakGlassCouncilActions= useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_PAST_COUNCIL_ACTIONS_LIST_NAME)
    return pastBreakGlassCouncilAction?.slice(from, to)
  }, [currentPage, pastBreakGlassCouncilAction])

  const handleClickPropagateBreakGlass = () => {
    dispatch(propagateBreakGlass())
  }

  useEffect(() => {
    isUserInBreakCouncilMember ? setIsGoBack(false) : setIsGoBack(true)
  }, [isUserInBreakCouncilMember])

  return (
    <Page>
      <PageHeader page={'break glass council'} />
      {isGoBack && isUserInBreakCouncilMember && (<GoBack
        onClick={() => {
          setIsPendingSignature(true)
          setIsGoBack(false)
        }}
      >
        <Icon id="arrow-left-stroke" />
        Back to Member Dashboard
      </GoBack>)}

      {isUserInBreakCouncilMember && !isGoBack && (
        <PropagateBreakGlassCouncilCard>
          <h1>Propagate Break Glass</h1>

          <Button
            className="start_verification"
            text="Propagate Break Glass"
            kind={ACTION_PRIMARY}
            icon={'plus'}
            onClick={handleClickPropagateBreakGlass}
          />
        </PropagateBreakGlassCouncilCard>)}

      {displayPendingSignature && <h1>Pending Signature</h1>}

      <BreakGlassCouncilStyled>
        <div className='left-block'>
          {displayPendingSignature && (
            <article className="pending">
              <div className="pending-items">
                <Carousel itemLength={breakGlassActionPendingMySignature.length} key={sliderKey}>
                  {breakGlassActionPendingMySignature.map((item) => (
                    <CouncilPendingView
                      execution_datetime={String(item.executionDatetime)}
                      key={item.id}
                      id={item.id}
                      action_type={item.actionType}
                      signers_count={item.signersCount}
                      initiator_id={item.initiatorId}
                      num_council_members={breakGlassCouncilMember.length}
                      councilPendingActionsLength={breakGlassActionPendingMySignature.length}
                      parameters={[]}
                    />
                  ))}
                </Carousel>
              </div>
            </article>)}

          {isGoBack ? 
          <>
            <h1>Past Break Glass Council Actions</h1>
            {paginatedPastBreakGlassCouncilActions.map((item) => (
              <CouncilPastActionView
                execution_datetime={String(item.executionDatetime)}
                key={item.id}
                action_type={item.actionType}
                signers_count={item.signersCount}
                num_council_members={breakGlassCouncilMember.length}
                council_id={item.breakGlassId}
              />
            ))}

            <Pagination
              itemsCount={pastBreakGlassCouncilAction.length}
              listName={BREAK_GLASS_PAST_COUNCIL_ACTIONS_LIST_NAME}
            />
          </> : 
          <>
             <AvaliableActions>
              <div className="top-bar">
                <h1 className="top-bar-title">Available Actions</h1>

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

              <BreakGlassCouncilForm action={chosenDdItem?.value} />
            </AvaliableActions>

            <h1>My Past Council Actions</h1>
            {paginatedMyPastCouncilActions.map((item) => (
              <CouncilPastActionView
                execution_datetime={item.execution_datetime}
                key={item.id}
                action_type={item.action_type}
                signers_count={item.signers_count}
                num_council_members={item.num_council_members}
                council_id={item.council_id}
              />
            ))}

            <Pagination
              itemsCount={mockHistory.length}
              listName={BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME}
            />  
          </>}
        </div>

        <div className='right-block'>
          {!isGoBack && (<ReviewPastCouncilActionsCard displayPendingSignature={displayPendingSignature} >
            <h2>Review Past Council Actions</h2>

            <Button
              text="Review"
              kind={ACTION_SECONDARY}
              onClick={() => {
                setIsGoBack(true)
                setIsPendingSignature(false)
              }}
            />
          </ReviewPastCouncilActionsCard>)}

          <h1>Break Glass Council</h1>
          
          {breakGlassCouncilMember.map((item) => (
            <CouncilMemberView
              key={item.id}
              image={item.image || item.name}
              name={item.name}
              user_id={item.userId}
              website={item.website}
              openModal={handleOpenleModal}
              showUpdateInfo={isUserInBreakCouncilMember}
            />
          ))}
        </div>
      </BreakGlassCouncilStyled>
      {isUpdateCouncilMemberInfo ? (
        <ModalPopup width={750} onClose={() => setIsUpdateCouncilMemberInfo(false)}>
          <FormUpdateCouncilMemberView />
        </ModalPopup>
      ) : null}
    </Page>
  )
}
