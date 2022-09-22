import React, { FC, useState, useMemo } from 'react'
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
import ModalPopup from '../../app/App.components/Modal/ModalPopup.view'
import { CouncilFormUpdateCouncilMemberInfo } from '../Council/CouncilForms/CouncilFormUpdateCouncilMemberInfo.view'

// helpers
import { ACTION_SECONDARY } from '../../app/App.components/Button/Button.constants'
import { 
  BREAK_GLASS_PAST_COUNCIL_ACTIONS_LIST_NAME, 
  BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME,
  calculateSlicePositions,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'

// styles
import { Page, BreakGlassCouncilStyled, ReviewPastCouncilActionsCard, GoBack, AvaliableActions } from './BreakGlassCouncil.style'

// TODO: change mock to valid data
const mockCards = [
  {
    execution_datetime: `${new Date()}`,
    id: 1,
    action_type: 'Sign Action',
    signers_count: 233,
    initiator_id: '3',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
  {
    execution_datetime: `${new Date()}`,
    id: 2,
    action_type: 'Add Council Member',
    signers_count: 233,
    initiator_id: '3',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
  {
    execution_datetime: `${new Date()}`,
    id: 3,
    action_type: 'Change Council Member',
    signers_count: 233,
    initiator_id: '3',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
  {
    execution_datetime: `${new Date()}`,
    id: 4,
    action_type: 'Update Council Member',
    signers_count: 233,
    initiator_id: '3',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
  {
    execution_datetime: `${new Date()}`,
    id: 5,
    action_type: 'Remove Council Member',
    signers_count: 233,
    initiator_id: 'rlejjtewjiorweiojtiowrjieojrtiow',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
]

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

const mockMembers = [
  {
    id: 1,
    image: 'https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png',
    name: 'Cat',
    user_id: 'jfdsafkjnadfkdasfasf',
    website: 'cat site',
    openModal: () => {},
  },
  {
    id: 2,
    image: 'https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png',
    name: 'Cat',
    user_id: 'fkldsajlfnasadsf',
    website: 'cat site',
    openModal: () => {},
  },
  {
    id: 3,
    image: 'https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png',
    name: 'Cat',
    user_id: 'asdkgjbkjfadsafkml',
    website: 'cat site',
    openModal: () => {},
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
  const { breakGlassCouncilMember } = useSelector((state: State) => state.breakGlass)
  
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
    return mockHistory?.slice(from, to)
  }, [currentPage, mockHistory])

  return (
    <Page>
      <PageHeader page={'break glass council'} />
      {isGoBack && (<GoBack
        onClick={() => {
          setIsPendingSignature(true)
          setIsGoBack(false)
        }}
      >
        <Icon id="arrow-left-stroke" />
        Back to Member Dashboard
      </GoBack>)}

      {isPendingSignature && <h1>Pending Signature</h1>}

      <BreakGlassCouncilStyled>
        <div className='left-block'>
          {isPendingSignature && (<article className="pending">
            <div className="pending-items">
              <Carousel itemLength={mockCards.length} key={sliderKey}>
                {mockCards.map((item) => (
                  <CouncilPendingView
                    execution_datetime={item.execution_datetime}
                    key={item.id}
                    id={item.id}
                    action_type={item.action_type}
                    signers_count={item.signers_count}
                    initiator_id={item.initiator_id}
                    num_council_members={item.num_council_members}
                    councilPendingActionsLength={item.councilPendingActionsLength}
                    parameters={item.parameters || []}
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
          {!isGoBack && (<ReviewPastCouncilActionsCard>
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
              image={item.image}
              name={item.name}
              user_id={item.userId}
              website={item.website}
              openModal={() => {}}
            />
          ))}
        </div>
      </BreakGlassCouncilStyled>
      {isUpdateCouncilMemberInfo ? (
        <ModalPopup width={750} onClose={() => setIsUpdateCouncilMemberInfo(false)}>
          <CouncilFormUpdateCouncilMemberInfo />
        </ModalPopup>
      ) : null}
    </Page>
  )
}
