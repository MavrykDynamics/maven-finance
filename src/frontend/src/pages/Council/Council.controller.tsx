import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { CouncilMember } from '../../utils/TypesAndInterfaces/Council'
import type { CouncilPastAction } from '../../reducers/council'

// actions
import { getCouncilPastActionsStorage, getCouncilPendingActionsStorage } from './Council.actions'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { CouncilPendingView } from './CouncilPending/CouncilPending.view'
import { CouncilPendingReviewView } from './CouncilPending/CouncilPendingReview.view'
import { CouncilMemberView } from './CouncilMember/CouncilMember.view'
import { CouncilPastActionView } from './CouncilPastAction/CouncilPastAction.view'
import { DropDown } from '../../app/App.components/DropDown/DropDown.controller'
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

// styles
import { Page } from 'styles'
import { CouncilStyled } from './Council.style'
import { DropdownWrap, DropdownCard } from '../../app/App.components/DropDown/DropDown.style'

export const Council = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { councilStorage, councilPastActions, councilPendingActions } = useSelector((state: State) => state.council)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const [isGoback, setIsGoback] = useState(false)
  const [sliderKey, setSliderKey] = useState(1)
  const [isPendingSignature, setIsPendingSignature] = useState(false)
  const { councilMembers } = councilStorage

  const isUserInCouncilMembers = Boolean(councilMembers.find((item: CouncilMember) => item.user_id === accountPkh)?.id)
  const isPendindList = councilPendingActions.length && isUserInCouncilMembers

  const curentCouncilPastActions = useMemo(
    () =>
      isPendingSignature
        ? councilPastActions?.filter((item: CouncilPastAction) => item.initiator_id === accountPkh)
        : councilPastActions,
    [councilPastActions, accountPkh, isPendingSignature],
  )

  const itemsForDropDown = [
    { text: 'Chose action', value: '' },
    { text: 'Add Vestee', value: 'addVestee' },
    { text: 'Add Council Member', value: 'addCouncilMember' },
    { text: 'Update Vestee', value: 'updateVestee' },
    { text: 'Toggle Vestee Lock', value: 'toggleVesteeLock' },
    { text: 'Change Council Member', value: 'changeCouncilMember' },
    { text: 'Remove Council Member', value: 'removeCouncilMember' },
    { text: 'Update Council Member Info', value: 'updateCouncilMemberInfo' },
    { text: 'Transfer Tokens', value: 'transferTokens' },
    { text: 'Request Tokens', value: 'requestTokens' },
    { text: 'Request Token Mint', value: 'requestTokenMint' },
    { text: 'Drop Financial Request', value: 'dropFinancialRequest' },
  ]

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {}

  const handleOnClickDropdownItem = (e: any) => {
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

  return (
    <Page>
      <PageHeader page={'council'} kind={PRIMARY} loading={loading} />
      <CouncilStyled>
        {isGoback ? (
          <button
            onClick={() => {
              setIsPendingSignature(true)
              setIsGoback(false)
            }}
            className="go-back"
          >
            <Icon id="arrow-left-stroke" />
            Back to Member Dashboard
          </button>
        ) : null}

        <article className={`council-details ${isPendindList ? 'is-user-member' : ''}`}>
          <div className="council-actions">
            {isPendingSignature && isPendindList ? (
              <>
                <h1>Pending Signature</h1>
                <article className="pending">
                  <div className="pending-items">
                    <Carousel itemLength={councilPendingActions?.length} key={sliderKey}>
                      {councilPendingActions.map((item) => (
                        <CouncilPendingView
                          executed_datetime={item.executed_datetime}
                          key={item.id}
                          id={item.id}
                          action_type={item.action_type}
                          signers_count={item.signers_count}
                          initiator_id={item.initiator_id}
                          num_council_members={councilMembers.length}
                          councilPendingActionsLength={councilPendingActions?.length}
                          council_action_record_parameters={item.council_action_record_parameters}
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
                    placeholder={ddItems[0]}
                    onChange={handleSelect}
                    isOpen={ddIsOpen}
                    itemSelected={chosenDdItem?.text}
                    items={ddItems}
                    onBlur={() => {}}
                    clickOnItem={(e) => handleOnClickDropdownItem(e)}
                  />
                </DropdownWrap>
                {chosenDdItem?.value === 'addVestee' ? <CouncilFormAddVestee /> : null}
                {chosenDdItem?.value === 'addCouncilMember' ? <CouncilFormAddCouncilMember /> : null}
                {chosenDdItem?.value === 'updateVestee' ? <CouncilFormUpdateVestee /> : null}
                {chosenDdItem?.value === 'toggleVesteeLock' ? <CouncilFormToggleVesteeLock /> : null}
                {chosenDdItem?.value === 'changeCouncilMember' ? <CouncilFormChangeCouncilMember /> : null}
                {chosenDdItem?.value === 'removeCouncilMember' ? <CouncilFormRemoveCouncilMember /> : null}
                {chosenDdItem?.value === 'updateCouncilMemberInfo' ? <CouncilFormUpdateCouncilMemberInfo /> : null}
                {chosenDdItem?.value === 'transferTokens' ? <CouncilFormTransferTokens /> : null}
                {chosenDdItem?.value === 'requestTokens' ? <CouncilFormRequestTokens /> : null}
                {chosenDdItem?.value === 'requestTokenMint' ? <CouncilFormRequestTokenMint /> : null}
                {chosenDdItem?.value === 'dropFinancialRequest' ? <CouncilFormDropFinancialRequest /> : null}
              </DropdownCard>
            ) : null}

            {curentCouncilPastActions?.length ? (
              <>
                <h1 className={`past-actions ${isPendingSignature ? 'is-user-member' : ''}`}>
                  {isPendingSignature ? 'My ' : null}Past Council Actions
                </h1>
                {curentCouncilPastActions.map((item: CouncilPastAction) => (
                  <CouncilPastActionView
                    executed_datetime={item.executed_datetime}
                    key={item.id}
                    action_type={item.action_type}
                    signers_count={item.signers_count}
                    num_council_members={councilMembers.length}
                  />
                ))}
              </>
            ) : null}
          </div>

          <aside
            className={`council-members ${isPendingSignature ? 'is-user-member' : ''} ${
              isPendindList && isPendingSignature ? 'is-pending-list' : ''
            }`}
          >
            {isPendingSignature ? (
              <CouncilPendingReviewView
                onClick={() => {
                  setIsGoback(true)
                  setIsPendingSignature(false)
                }}
              />
            ) : null}

            {councilMembers.length ? (
              <div>
                <h1>Council Members</h1>
                {councilMembers.map((item: CouncilMember) => (
                  <CouncilMemberView key={item.id} image={item.image} name={item.name} user_id={item.user_id} />
                ))}
              </div>
            ) : null}
          </aside>
        </article>
      </CouncilStyled>
    </Page>
  )
}
