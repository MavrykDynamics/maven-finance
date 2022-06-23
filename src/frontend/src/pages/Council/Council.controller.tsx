import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { CouncilMember } from '../../utils/TypesAndInterfaces/Council'

// actions
import { getCouncilPastActionsStorage } from './Council.actions'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { CouncilPendingView } from './CouncilPending/CouncilPending.view'
import { CouncilPendingReviewView } from './CouncilPending/CouncilPendingReview.view'
import { CouncilMemberView } from './CouncilMember/CouncilMember.view'
import { CouncilPastActionView } from './CouncilPastAction/CouncilPastAction.view'
import { DropDown } from '../../app/App.components/DropDown/DropDown.controller'
import { CouncilFormAddVestee } from './CouncilForms/CouncilFormAddVestee.view'

// styles
import { Page } from 'styles'
import { CouncilStyled } from './Council.style'
import { DropdownWrap, DropdownCard } from '../../app/App.components/DropDown/DropDown.style'

export const Council = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { councilStorage, councilPastActions } = useSelector((state: State) => state.council)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  const { councilMembers } = councilStorage

  const isUserInCouncilMembers = Boolean(councilMembers.find((item: CouncilMember) => item.user_id === accountPkh)?.id)

  const itemsForDropDown = [
    { text: 'Suspend Satellite', value: 'suspendSatellite' },
    { text: 'Test 0', value: 'satelliteFee' },
    { text: 'Test 1', value: 'totalDelegatedAmount' },
    { text: 'Test 2', value: 'participation' },
  ]

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

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

  return (
    <Page>
      <PageHeader page={'council'} kind={PRIMARY} loading={loading} />
      <CouncilStyled>
        {isUserInCouncilMembers ? (
          <>
            <h1>Pending Signature</h1>
            <article className="pending">
              <div className="pending-items">
                <CouncilPendingView />
                <CouncilPendingView />
                <CouncilPendingView />
              </div>

              <CouncilPendingReviewView />
            </article>
          </>
        ) : null}
        <article className={`council-details ${isUserInCouncilMembers ? 'is-user-member' : ''}`}>
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
                <CouncilFormAddVestee />
              </DropdownCard>
            ) : null}

            {councilPastActions?.length ? (
              <>
                <h1 className={`past-actions ${isUserInCouncilMembers ? 'is-user-member' : ''}`}>
                  {isUserInCouncilMembers ? 'My ' : null}Past Council Actions
                </h1>
                {councilPastActions.map((item) => (
                  <CouncilPastActionView executed_datetime={item.executed_datetime} key={item.id} />
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
