import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { CouncilMember } from '../../utils/TypesAndInterfaces/Council'
import type { CouncilPastAction } from '../../reducers/council'

// actions
import { getCouncilPastActionsStorage, getCouncilPendingActionsStorage } from './Council.actions'

// view
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

// styles
import { Page } from 'styles'
import { CouncilStyled } from './Council.style'
import { DropdownWrap, DropdownCard } from '../../app/App.components/DropDown/DropDown.style'

export const Council = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { councilStorage, councilPastActions, councilPendingActions } = useSelector((state: State) => state.council)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  const { councilMembers } = councilStorage

  const isUserInCouncilMembers = Boolean(councilMembers.find((item: CouncilMember) => item.user_id === accountPkh)?.id)

  const itemsForDropDown = [
    { text: 'Chose action', value: '' },
    { text: 'Add Vestee', value: 'addVestee' },
    { text: 'Add Council Member', value: 'addCouncilMember' },
    { text: 'Update Vestee', value: 'updateVestee' },
  ]

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

  const isPendingSignature = isUserInCouncilMembers && councilPendingActions.length

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {
    console.log('%c ||||| item', 'color:yellowgreen', item)
  }

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
  }, [accountPkh])

  return (
    <Page>
      <PageHeader page={'council'} kind={PRIMARY} loading={loading} />
      <CouncilStyled>
        {isPendingSignature ? (
          <>
            <h1>Pending Signature</h1>
            <article className="pending">
              <div className="pending-items">
                {councilPendingActions.map((item) => (
                  <CouncilPendingView
                    executed_datetime={item.executed_datetime}
                    key={item.id}
                    action_type={item.action_type}
                    signers_count={item.signers_count}
                    initiator_id={item.initiator_id}
                    num_council_members={councilMembers.length}
                  />
                ))}
              </div>

              <CouncilPendingReviewView />
            </article>
          </>
        ) : null}
        <article className={`council-details ${isPendingSignature ? 'is-user-member' : ''}`}>
          <div className="council-actions">
            {isUserInCouncilMembers ? (
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
              </DropdownCard>
            ) : null}

            {councilPastActions?.length ? (
              <>
                <h1 className={`past-actions ${isPendingSignature ? 'is-user-member' : ''}`}>
                  {isUserInCouncilMembers ? 'My ' : null}Past Council Actions
                </h1>
                {councilPastActions.map((item: CouncilPastAction) => (
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
          {councilMembers.length ? (
            <aside className={`council-members ${isUserInCouncilMembers ? 'is-user-member' : ''}`}>
              <h1>Council Members</h1>
              {councilMembers.map((item: CouncilMember) => (
                <CouncilMemberView key={item.id} image={item.image} name={item.name} user_id={item.user_id} />
              ))}
            </aside>
          ) : null}
        </article>
      </CouncilStyled>
    </Page>
  )
}
