import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useHistory, useLocation } from 'react-router-dom'
import qs from 'qs'

// type
import type { CouncilMember } from '../../utils/TypesAndInterfaces/Council'
import type { CouncilPastAction } from '../../reducers/council'

// actions, consts
import { getCouncilPastActionsStorage, getCouncilPendingActionsStorage } from './Council.actions'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { calculateSlicePositions, COUNCIL_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { memberIsFirstOfList } from './Council.helpers'

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

// styles
import { Page } from 'styles'
import { CouncilStyled } from './Council.style'
import { DropdownCard, DropdownWrap } from '../../app/App.components/DropDown/DropDown.style'

export const Council = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()
  const loading = useSelector((state: State) => state.loading)
  const { councilStorage, councilPastActions, councilPendingActions } = useSelector((state: State) => state.council)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const [sliderKey, setSliderKey] = useState(1)
  const [isPendingSignature, setIsPendingSignature] = useState(false)
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const { councilMembers } = councilStorage

  const isUserInCouncilMembers = Boolean(councilMembers.find((item: CouncilMember) => item.userId === accountPkh)?.id)
  const isPendingList = councilPendingActions?.length && isUserInCouncilMembers

  const currentCouncilPastActions = useMemo(
    () =>
      isPendingSignature
        ? councilPastActions?.filter((item: CouncilPastAction) => item.initiator_id === accountPkh)
        : councilPastActions,
    [councilPastActions, accountPkh, isPendingSignature],
  )

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

  const { review: isReviewPage = false } = qs.parse(search, { ignoreQueryPrefix: true }) as { review?: boolean }
  const stringifiedQP = qs.stringify({ review: true })
  
  const handleClickReview = () => {
    setIsPendingSignature(false)
    history.push(`${pathname}?${stringifiedQP}`)
  }

  const handleClickGoBack = () => {
    setIsPendingSignature(true)
    history.push(`${pathname}`)
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

  useEffect(() => {
    dispatch(getCouncilPastActionsStorage())
  }, [dispatch])

  useEffect(() => {
    if (accountPkh) dispatch(getCouncilPendingActionsStorage())
    setSliderKey(sliderKey + 1)
  }, [accountPkh])

  useEffect(() => {
    setIsPendingSignature(Boolean(isUserInCouncilMembers))
  }, [isUserInCouncilMembers])

  const handleOpenleModal = () => {
    setIsUpdateCouncilMemberInfo(true)
  }

  const currentPage = getPageNumber(search, COUNCIL_LIST_NAME)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_LIST_NAME)
    return currentCouncilPastActions?.slice(from, to)
  }, [currentPage, currentCouncilPastActions])

  useEffect(() => {
    history.push(isUserInCouncilMembers ? `${pathname}` : `${pathname}?${stringifiedQP}`)
  }, [isUserInCouncilMembers])

  return (
    <Page>
      <PageHeader page={'council'} />
      <CouncilStyled>
        {isReviewPage ? (
          <button
            onClick={handleClickGoBack}
            className="go-back"
          >
            <Icon id="arrow-left-stroke" />
            Back to Member Dashboard
          </button>
        ) : null}

        <article
          className={`council-details ${isPendingList ? 'is-user-member' : ''} ${
            isPendingSignature ? 'is-pending-signature' : ''
          }`}
        >
          <div className="council-actions">
            {isPendingSignature && isPendingList ? (
              <>
                <h1>Pending Signature</h1>
                <article className="pending">
                  <div className="pending-items">
                    <Carousel itemLength={councilPendingActions?.length} key={sliderKey}>
                      {councilPendingActions.map((item) => (
                        <CouncilPendingView
                          execution_datetime={item.execution_datetime}
                          key={item.id}
                          id={item.id}
                          action_type={item.action_type}
                          signers_count={item.signers_count}
                          initiator_id={item.initiator_id}
                          num_council_members={councilMembers.length}
                          councilPendingActionsLength={councilPendingActions?.length}
                          parameters={item.parameters || []}
                        />
                      ))}
                    </Carousel>
                  </div>
                </article>
              </>
            ) : null}
            {isPendingSignature ? (
              <DropdownCard className="pending-dropdown">
                <DropdownWrap>
                  <h2>Available Actions</h2>
                  <DropDown
                    clickOnDropDown={handleClickDropdown}
                    placeholder='Choose action'
                    isOpen={ddIsOpen}
                    itemSelected={chosenDdItem?.text}
                    items={ddItems}
                    clickOnItem={(e) => handleOnClickDropdownItem(e)}
                  />
                </DropdownWrap>
                {chosenDdItem?.value === 'addVestee' ? <CouncilFormAddVestee /> : null}
                {chosenDdItem?.value === 'addCouncilMember' ? <CouncilFormAddCouncilMember /> : null}
                {chosenDdItem?.value === 'updateVestee' ? <CouncilFormUpdateVestee /> : null}
                {chosenDdItem?.value === 'removeVestee' ? <CouncilFormRemoveVestee /> : null}
                {chosenDdItem?.value === 'toggleVesteeLock' ? <CouncilFormToggleVesteeLock /> : null}
                {chosenDdItem?.value === 'changeCouncilMember' ? <CouncilFormChangeCouncilMember /> : null}
                {chosenDdItem?.value === 'removeCouncilMember' ? <CouncilFormRemoveCouncilMember /> : null}
                {chosenDdItem?.value === 'transferTokens' ? <CouncilFormTransferTokens /> : null}
                {chosenDdItem?.value === 'requestTokens' ? <CouncilFormRequestTokens /> : null}
                {chosenDdItem?.value === 'requestTokenMint' ? <CouncilFormRequestTokenMint /> : null}
                {chosenDdItem?.value === 'dropFinancialRequest' ? <CouncilFormDropFinancialRequest /> : null}
                {chosenDdItem?.value === 'setBaker' ? <CouncilFormSetBaker /> : null}
                {chosenDdItem?.value === 'setContractBaker' ? <CouncilFormSetContractBaker /> : null}
              </DropdownCard>
            ) : null}

            {currentCouncilPastActions?.length ? (
              <>
                <h1 className={`past-actions ${isPendingSignature ? 'is-user-member' : ''}`}>
                  {isPendingSignature ? 'My ' : null}Past Council Actions
                </h1>
                {paginatedItemsList.map((item: CouncilPastAction) => (
                  <CouncilPastActionView
                    execution_datetime={item.execution_datetime}
                    key={item.id}
                    action_type={item.action_type}
                    signers_count={item.signers_count}
                    num_council_members={councilMembers.length}
                    council_id={item.council_id}
                  />
                ))}
                <Pagination itemsCount={currentCouncilPastActions.length} listName={COUNCIL_LIST_NAME} />
              </>
            ) : null}
          </div>

          <aside
            className={`council-members ${isPendingSignature ? 'is-user-member' : ''} ${
              isPendingList && isPendingSignature ? 'is-pending-list' : ''
            }`}
          >
            {isPendingSignature ? (
              <CouncilPendingReviewView onClick={handleClickReview} />
            ) : null}

            {sortedCouncilMembers.length ? (
              <div>
                <h1>Council Members</h1>
                {sortedCouncilMembers.map((item: CouncilMember) => (
                  <CouncilMemberView
                    key={item.id}
                    image={item.image}
                    name={item.name}
                    userId={item.userId}
                    website={item.website}
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
          <CouncilFormUpdateCouncilMemberInfo />
        </ModalPopup>
      ) : null}
    </Page>
  )
}
