import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useHistory, useLocation } from 'react-router-dom'
import { useParams } from 'react-router'

// actions, consts
import { getCouncilPastActionsStorage, getCouncilPendingActionsStorage, getCouncilStorage, dropRequest } from './Council.actions'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { calculateSlicePositions, COUNCIL_LIST_NAME, COUNCIL_MY_PAST_ACTIONS_LIST_NAME, COUNCIL_MY_ONGOING_ACTIONS_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { memberIsFirstOfList } from './Council.helpers'
import { scrollUpPage } from 'utils/scrollUpPage'
import { councilTabsList } from 'pages/BreakGlassCouncil/BreakGlassCouncil.controller'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilPendingView } from './CouncilPending/CouncilPending.view'
import { CouncilPendingReviewView } from './CouncilPending/CouncilPendingReview.view'
import { CouncilMemberView } from './CouncilMember/CouncilMember.view'
import { CouncilPastActionView } from './CouncilPastAction/CouncilPastAction.view'
import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { CouncilFormAddVestee } from './CouncilForms/CouncilFormAddVestee.view'
import { CouncilFormAddCouncilMember } from './CouncilForms/CouncilFormAddCouncilMember.view'
import { CouncilFormUpdateVestee } from './CouncilForms/CouncilFormUpdateVestee.view'
import { CouncilFormToggleVesteeLock } from './CouncilForms/CouncilFormToggleVesteeLock.view'
import { CouncilFormChangeCouncilMember } from './CouncilForms/CouncilFormChangeCouncilMember.view'
import { CouncilFormRemoveCouncilMember } from './CouncilForms/CouncilFormRemoveCouncilMember.view'
import { CouncilFormUpdateCouncilMemberInfo } from './CouncilForms/CouncilFormUpdateCouncilMemberInfo.view'
import { CouncilFormTransferTokens } from './CouncilForms/CouncilFormTransferTokens.view'
import { CouncilFormRequestTokens } from './CouncilForms/CouncilFormRequestTokens.view'
import { CouncilFormRequestTokenMint } from './CouncilForms/CouncilFormRequestTokenMint.view'
import { CouncilFormDropFinancialRequest } from './CouncilForms/CouncilFormDropFinancialRequest.view'
import { CouncilFormRemoveVestee } from './CouncilForms/CouncilFormRemoveVestee.view'
import { CouncilFormSetBaker } from './CouncilForms/CouncilFormSetBaker.view'
import { CouncilFormSetContractBaker } from './CouncilForms/CouncilFormSetContractBaker.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import ModalPopup from '../../app/App.components/Modal/ModalPopup.view'
import { MyCouncilActions } from 'pages/Council/MyCouncilActions.view'

// styles
import { Page } from 'styles'
import { CouncilStyled } from './Council.style'
import { DropdownCard, DropdownWrap } from '../../app/App.components/DropDown/DropDown.style'

const queryParameters = {
  pathname: '/mavryk-council',
  review: '/review',
  pendingReview: '/pending-review'
}

export type QueryParameters = typeof queryParameters

export const Council = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()

  const { councilStorage, councilPastActions, councilMyPastActions, councilPendingActions, councilMyPendingActions } = useSelector((state: State) => state.council)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const [sliderKey, setSliderKey] = useState(1)
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const { councilMembers } = councilStorage
  const [activeActionTab, setActiveActionTab] = useState(councilTabsList[0].text)

  const councilMemberMaxLength = {
    councilMemberNameMaxLength: councilStorage?.councilMemberNameMaxLength,
    councilMemberWebsiteMaxLength: councilStorage?.councilMemberWebsiteMaxLength,
  }

  const isUserInCouncilMembers = Boolean(councilMembers.find((item) => item.userId === accountPkh)?.id)
  const isPendingList = councilPendingActions?.length && isUserInCouncilMembers
  const { review } = useParams<{ review: string }>()
  const isReviewPage = review === 'review'

  const itemsForDropDown = [
    { text: 'Add Vestee', value: 'addVestee' },
    { text: 'Add Council Member', value: 'addCouncilMember' },
    { text: 'Update Vestee', value: 'updateVestee' },
    { text: 'Toggle Vestee Lock', value: 'toggleVesteeLock' },
    { text: 'Remove Vestee', value: 'removeVestee' },
    { text: 'Change Council Member', value: 'changeCouncilMember' },
    { text: 'Remove Council Member', value: 'removeCouncilMember' },
    { text: 'Transfer Tokens', value: 'transferTokens' },
    { text: 'Request Tokens', value: 'requestTokens' },
    { text: 'Request Token Mint', value: 'requestTokenMint' },
    { text: 'Drop Financial Request', value: 'dropFinancialRequest' },
    { text: 'Set Baker', value: 'setBaker' },
    { text: 'Set Contract Baker', value: 'setContractBaker' },
  ]

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()
  const sortedCouncilMembers = memberIsFirstOfList(councilMembers, accountPkh)

  const handleClickReview = (review: string) => {
    history.replace(`${queryParameters.pathname}${review}`)
    setActiveActionTab((councilTabsList[0].text))
    scrollUpPage()
  }

  const handleClickGoBack = () => {
    history.replace(queryParameters.pathname)
  }

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: DropdownItemType) => {}

  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  const handleDropAction = (id: number) => {    
    dispatch(dropRequest(id))
  }

  useEffect(() => {
    dispatch(getCouncilPastActionsStorage())
    dispatch(getCouncilStorage())
  }, [dispatch])

  useEffect(() => {
    if (accountPkh) dispatch(getCouncilPendingActionsStorage())
    setSliderKey(sliderKey + 1)
  }, [accountPkh])

  const handleOpenleModal = () => {
    setIsUpdateCouncilMemberInfo(true)
  }

  const currentPage = getPageNumber(
    search,
    review 
      ? COUNCIL_LIST_NAME 
      : councilTabsList[0].text === activeActionTab
        ? COUNCIL_MY_ONGOING_ACTIONS_LIST_NAME
        : COUNCIL_MY_PAST_ACTIONS_LIST_NAME,
  )

  const paginatedCouncilPastActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_LIST_NAME)
    return councilPastActions?.slice(from, to)
  }, [currentPage, councilPastActions])

  const paginatedCouncilMyPastActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_MY_PAST_ACTIONS_LIST_NAME)
    return councilMyPastActions?.slice(from, to)
  }, [currentPage, councilMyPastActions])

  const paginatedCouncilPendingActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_LIST_NAME)
    return councilPendingActions?.slice(from, to)
  }, [currentPage, councilPendingActions])

  const paginatedCouncilMyPendingActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_MY_ONGOING_ACTIONS_LIST_NAME)
    return councilMyPendingActions?.slice(from, to)
  }, [currentPage, councilMyPendingActions])

  useEffect(() => {
    // redirect to review or main page when member changes
    history.replace(
      isUserInCouncilMembers ? queryParameters.pathname : `${queryParameters.pathname}${queryParameters.review}`,
    )
  }, [history, isUserInCouncilMembers])

  useEffect(() => {
    // check authorization when clicking on a review or a header in the menu
    if (!isUserInCouncilMembers) {
      history.replace(`${queryParameters.pathname}${queryParameters.review}`)
    }
  }, [history, isUserInCouncilMembers, pathname])

  return (
    <Page>
      <PageHeader page={'council'} />
      <CouncilStyled>
        {review && isUserInCouncilMembers ? (
          <button onClick={handleClickGoBack} className="go-back">
            <Icon id="arrow-left-stroke" />
            Back to Member Dashboard
          </button>
        ) : null}

        <article
          className={`council-details ${isPendingList ? 'is-user-member' : ''} ${
            !review ? 'is-pending-signature' : ''
          }`}
        >
          <div className="council-actions">
            {!review && isPendingList ? (
              <>
                <h1>Pending Signature</h1>
                <article className="pending">
                  <div className="pending-items">
                    <Carousel itemLength={councilPendingActions?.length} key={sliderKey}>
                      {councilPendingActions.map((item) => (
                        <CouncilPendingView
                          {...item}
                          key={item.id} 
                          numCouncilMembers={councilMembers.length}
                          councilPendingActionsLength={councilPendingActions.length}
                        />
                      ))}
                    </Carousel>
                  </div>
                </article>
              </>
            ) : null}
            {!review ? (
              <DropdownCard className="pending-dropdown">
                <DropdownWrap>
                  <h2>Available Actions</h2>
                  <DropDown
                    clickOnDropDown={handleClickDropdown}
                    placeholder="Choose action"
                    isOpen={ddIsOpen}
                    setIsOpen={setDdIsOpen}
                    itemSelected={chosenDdItem?.text}
                    items={ddItems}
                    clickOnItem={(e) => handleOnClickDropdownItem(e)}
                  />
                </DropdownWrap>
                {chosenDdItem?.value === 'addVestee' ? <CouncilFormAddVestee /> : null}
                {chosenDdItem?.value === 'addCouncilMember' ? (
                  <CouncilFormAddCouncilMember {...councilMemberMaxLength} />
                ) : null}
                {chosenDdItem?.value === 'updateVestee' ? <CouncilFormUpdateVestee /> : null}
                {chosenDdItem?.value === 'removeVestee' ? <CouncilFormRemoveVestee /> : null}
                {chosenDdItem?.value === 'toggleVesteeLock' ? <CouncilFormToggleVesteeLock /> : null}
                {chosenDdItem?.value === 'changeCouncilMember' ? (
                  <CouncilFormChangeCouncilMember {...councilMemberMaxLength} />
                ) : null}
                {chosenDdItem?.value === 'removeCouncilMember' ? <CouncilFormRemoveCouncilMember /> : null}
                {chosenDdItem?.value === 'transferTokens' ? (
                  <CouncilFormTransferTokens requestPurposeMaxLength={councilStorage.requestPurposeMaxLength} />
                ) : null}
                {chosenDdItem?.value === 'requestTokens' ? (
                  <CouncilFormRequestTokens
                    requestTokenNameMaxLength={councilStorage.requestTokenNameMaxLength}
                    requestPurposeMaxLength={councilStorage.requestPurposeMaxLength}
                  />
                ) : null}
                {chosenDdItem?.value === 'requestTokenMint' ? (
                  <CouncilFormRequestTokenMint requestPurposeMaxLength={councilStorage.requestPurposeMaxLength} />
                ) : null}
                {chosenDdItem?.value === 'dropFinancialRequest' ? <CouncilFormDropFinancialRequest /> : null}
                {chosenDdItem?.value === 'setBaker' ? <CouncilFormSetBaker /> : null}
                {chosenDdItem?.value === 'setContractBaker' ? <CouncilFormSetContractBaker /> : null}
              </DropdownCard>
            ) : null}

           
            {review && (
              <>
                <h1 className={`past-actions ${!review ? 'is-user-member' : ''}`}>
                  {isReviewPage ? 'Past Council Actions' : 'Pending Signature Council Actions'}
                </h1>
                {(isReviewPage ? paginatedCouncilPastActions : paginatedCouncilPendingActions).map((item) => (
                  <CouncilPastActionView
                    executionDatetime={String(item.executionDatetime)}
                    key={item.id}
                    actionType={item.actionType}
                    signersCount={item.signersCount}
                    numCouncilMembers={councilMembers.length}
                    councilId={item.councilId}
                  />
                ))}
                <Pagination itemsCount={isReviewPage ? councilPastActions.length : councilPendingActions.length} listName={COUNCIL_LIST_NAME} />
              </>
            )}

            {!review && 
              <MyCouncilActions
                myPastCouncilAction={paginatedCouncilMyPastActions}
                myPastCouncilActionLength={councilMyPastActions.length}
                actionPendingSignature={paginatedCouncilMyPendingActions}
                actionPendingSignatureLength={councilMyPendingActions.length}
                numCouncilMembers={councilMembers.length}
                activeActionTab={activeActionTab}
                setActiveActionTab={setActiveActionTab}
                tabsList={councilTabsList}
                handleDropAction={handleDropAction}
                listNameMyPastActions={COUNCIL_MY_PAST_ACTIONS_LIST_NAME}
                listNameMyOngoingActions={COUNCIL_MY_ONGOING_ACTIONS_LIST_NAME}
              />}
          </div>

          <aside
            className={`council-members ${!review ? 'is-user-member' : ''} ${
              isPendingList && !review ? 'is-pending-list' : ''
            }`}
          >
            {!review ? <CouncilPendingReviewView onClick={handleClickReview} queryParameters={queryParameters} /> : null}

            {sortedCouncilMembers.length ? (
              <div>
                <h1>Council Members</h1>
                {sortedCouncilMembers.map((item) => (
                  <CouncilMemberView
                    key={item.id}
                    image={item.image}
                    name={item.name}
                    userId={item.userId}
                    openModal={handleOpenleModal}
                  />
                ))}
              </div>
            ) : null}
          </aside>
        </article>
      </CouncilStyled>
      {isUpdateCouncilMemberInfo ? (
        <ModalPopup width={750} onClose={() => setIsUpdateCouncilMemberInfo(false)}>
          <CouncilFormUpdateCouncilMemberInfo {...councilMemberMaxLength} />
        </ModalPopup>
      ) : null}
    </Page>
  )
}
