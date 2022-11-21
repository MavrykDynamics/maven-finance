import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useHistory, useLocation } from 'react-router-dom'
import { useParams } from 'react-router'

// components
import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { CouncilPastActionView } from 'pages/Council/CouncilPastAction/CouncilPastAction.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { CouncilMemberView } from 'pages/Council/CouncilMember/CouncilMember.view'
import Icon from '../../app/App.components/Icon/Icon.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { BreakGlassCouncilForm, actions } from './BreakGlassCouncilForms/BreakGlassCouncilForm.controller'
import { FormUpdateCouncilMemberView } from './BreakGlassCouncilForms/FormUpdateCouncilMember.view'
import { BreakGlassCouncilPanding } from './BreakGlassCouncilPanding/BreakGlassCouncilPanding.controller'
import { BreakGlassCouncilMyActions } from './BreakGlassCouncilMyActions.view'

// helpers
import { ACTION_SECONDARY } from '../../app/App.components/Button/Button.constants'
import {
  BREAK_GLASS_PAST_COUNCIL_ACTIONS_LIST_NAME,
  BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME,
  calculateSlicePositions,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { ACTION_PRIMARY } from '../../app/App.components/Button/Button.constants'
import { getSeparateSnakeCase } from 'utils/parse'
import { memberIsFirstOfList } from 'pages/Council/Council.helpers'
import { scrollUpPage } from 'utils/scrollUpPage'

// styles
import {
  Page,
  BreakGlassCouncilStyled,
  ReviewPastCouncilActionsCard,
  GoBack,
  AvaliableActions,
  ModalPopup,
  PropagateBreakGlassCouncilCard,
} from './BreakGlassCouncil.style'

// actions
import {
  propagateBreakGlass,
  getBreakGlassActionPendingSignature,
  getMyPastBreakGlassCouncilAction,
  getPastBreakGlassCouncilAction,
  getBreakGlassCouncilMember,
} from './BreakGlassCouncil.actions'

const queryParameters = {
  pathname: '/break-glass-council',
  review: '/review',
}

export function BreakGlassCouncil() {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    breakGlassStorage,
    breakGlassCouncilMember,
    breakGlassActionPendingMySignature,
    breakGlassActionPendingSignature,
    pastBreakGlassCouncilAction,
    myPastBreakGlassCouncilAction,
    glassBroken,
  } = useSelector((state: State) => state.breakGlass)
  const itemsForDropDown = useMemo(
    () =>
      Object.values(actions).map((item) => {
        return {
          text: getSeparateSnakeCase(item),
          value: item,
        }
      }),
    [],
  )

  const ddItems = useMemo(() => itemsForDropDown.map(({ text }) => text), [itemsForDropDown])
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()

  const [sliderKey, setSliderKey] = useState(1)
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)

  const sortedBreakGlassCouncilMembers = memberIsFirstOfList(breakGlassCouncilMember, accountPkh)
  const { review: isReviewPage } = useParams<{ review: string }>()

  const isUserInBreakCouncilMember = Boolean(breakGlassCouncilMember.find((item) => item.userId === accountPkh)?.id)
  const displayPendingSignature = Boolean(
    !isReviewPage && isUserInBreakCouncilMember && breakGlassActionPendingSignature?.length,
  )

  const councilMemberMaxLength = {
    councilMemberNameMaxLength: breakGlassStorage?.config?.councilMemberNameMaxLength,
    councilMemberWebsiteMaxLength: breakGlassStorage?.config?.councilMemberWebsiteMaxLength,
  }

  const handleClickReview = () => {
    history.replace(`${queryParameters.pathname}${queryParameters.review}`)
    scrollUpPage()
  }

  const handleClickGoBack = () => {
    history.replace(queryParameters.pathname)
  }

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
    search,
    isReviewPage ? BREAK_GLASS_PAST_COUNCIL_ACTIONS_LIST_NAME : BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME,
  )

  const paginatedMyPastCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME)
    return myPastBreakGlassCouncilAction?.slice(from, to)
  }, [currentPage, myPastBreakGlassCouncilAction])

  const paginatedPastBreakGlassCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_PAST_COUNCIL_ACTIONS_LIST_NAME)
    return pastBreakGlassCouncilAction?.slice(from, to)
  }, [currentPage, pastBreakGlassCouncilAction])

  const handleClickPropagateBreakGlass = () => {
    dispatch(propagateBreakGlass())
  }

  useEffect(() => {
    dispatch(getMyPastBreakGlassCouncilAction())
    dispatch(getPastBreakGlassCouncilAction())
    dispatch(getBreakGlassCouncilMember())
  }, [dispatch])

  useEffect(() => {
    if (accountPkh) dispatch(getBreakGlassActionPendingSignature())
    setSliderKey(sliderKey + 1)
  }, [dispatch, accountPkh])

  useEffect(() => {
    // redirect to review or main page when member changes
    history.replace(
      isUserInBreakCouncilMember ? queryParameters.pathname : `${queryParameters.pathname}${queryParameters.review}`,
    )
  }, [history, isUserInBreakCouncilMember])

  useEffect(() => {
    // check authorization when clicking on a review or a header in the menu
    if (!isUserInBreakCouncilMember) {
      history.replace(`${queryParameters.pathname}${queryParameters.review}`)
    }
  }, [history, isUserInBreakCouncilMember, pathname])

  return (
    <Page>
      <PageHeader page={'break glass council'} />
      {isReviewPage && isUserInBreakCouncilMember && (
        <GoBack onClick={handleClickGoBack}>
          <Icon id="arrow-left-stroke" />
          Back to Member Dashboard
        </GoBack>
      )}

      {isUserInBreakCouncilMember && !isReviewPage && (
        <PropagateBreakGlassCouncilCard>
          <h1>Propagate Break Glass</h1>

          <Button
            className="start_verification"
            text="Propagate Break Glass"
            kind={ACTION_PRIMARY}
            icon={'plus'}
            onClick={handleClickPropagateBreakGlass}
            disabled={glassBroken}
          />
        </PropagateBreakGlassCouncilCard>
      )}

      {displayPendingSignature && <h1>Pending Signature</h1>}

      <BreakGlassCouncilStyled>
        <div className="left-block">
          {displayPendingSignature && (
            <article className="pending">
              <div className="pending-items">
                <Carousel itemLength={breakGlassActionPendingSignature.length} key={sliderKey}>
                  {breakGlassActionPendingSignature.map((item) => (
                    <BreakGlassCouncilPanding
                      {...item}
                      key={item.id}
                      numCouncilMembers={breakGlassCouncilMember.length}
                      councilPendingActionsLength={breakGlassActionPendingSignature.length}
                    />
                  ))}
                </Carousel>
              </div>
            </article>
          )}

          {isReviewPage ? (
            <>
              {Boolean(pastBreakGlassCouncilAction.length) && (
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
                </>
              )}
            </>
          ) : (
            <>
              <AvaliableActions>
                <div className="top-bar">
                  <h1 className="top-bar-title">Available Actions</h1>

                  <div className="dropdown-size">
                    <DropDown
                      clickOnDropDown={handleClickDropdown}
                      placeholder="Choose action"
                      isOpen={ddIsOpen}
                      setIsOpen={setDdIsOpen}
                      itemSelected={chosenDdItem?.text}
                      items={ddItems}
                      clickOnItem={(e) => handleClickDropdownItem(e)}
                    />
                  </div>
                </div>

                <BreakGlassCouncilForm councilMemberMaxLength={councilMemberMaxLength} action={chosenDdItem?.value} />
              </AvaliableActions>

              <BreakGlassCouncilMyActions
                paginatedMyPastCouncilActions={paginatedMyPastCouncilActions}
                breakGlassCouncilMemberLength={breakGlassCouncilMember.length}
                myPastBreakGlassCouncilActionLength={myPastBreakGlassCouncilAction.length}
              />
            </>
          )}
        </div>

        <div className="right-block">
          {!isReviewPage && (
            <ReviewPastCouncilActionsCard displayPendingSignature={displayPendingSignature}>
              <h2>Review Past Council Actions</h2>

              <Button text="Review" kind={ACTION_SECONDARY} onClick={handleClickReview} />
            </ReviewPastCouncilActionsCard>
          )}

          {Boolean(sortedBreakGlassCouncilMembers.length) && (
            <>
              <h1>Break Glass Council</h1>

              {sortedBreakGlassCouncilMembers.map((item) => (
                <CouncilMemberView
                  key={item.id}
                  image={item.image || item.name}
                  name={item.name}
                  userId={item.userId}
                  openModal={handleOpenleModal}
                  showUpdateInfo={isUserInBreakCouncilMember}
                />
              ))}
            </>
          )}
        </div>
      </BreakGlassCouncilStyled>
      {isUpdateCouncilMemberInfo ? (
        <ModalPopup width={750} onClose={() => setIsUpdateCouncilMemberInfo(false)}>
          <FormUpdateCouncilMemberView councilMemberMaxLength={councilMemberMaxLength} />
        </ModalPopup>
      ) : null}
    </Page>
  )
}
