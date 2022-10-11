import React, { FC, useState, useMemo, useEffect } from 'react'
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
  getBreakGlassActionPendingMySignature,
  getMyPastBreakGlassCouncilAction,
  getPastBreakGlassCouncilAction,
  getBreakGlassCouncilMember,
} from './BreakGlassCouncil.actions'

const queryParameters = {
  pathname: '/break-glass-council',
  review: '/review',
}

const breakGlassActionPendingMySignature = [
  {
    "action_type": "removeCouncilMember",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:19:15+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:19:15+00:00",
    "id": 2,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:19:15+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 2,
        "break_glass_action_id": 2
      }
    ],
    "parameters": [
      {
        "id": 5,
        "name": "councilMemberAddress",
        "value": "050a0000001600004202f4b8b703ac045cae2f4f8a41757010e0af73"
      }
    ]
  },
  {
    "action_type": "changeCouncilMember",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:19:30+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:19:30+00:00",
    "id": 3,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:19:30+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 3,
        "break_glass_action_id": 3
      }
    ],
    "parameters": [
      {
        "id": 6,
        "name": "newCouncilMemberName",
        "value": "0501000000055472756479"
      },
      {
        "id": 7,
        "name": "newCouncilMemberImage",
        "value": "05010000005d68747470733a2f2f7777772e696865617274726164696f2e63612f696d6167652f706f6c6963793a312e31353733313834343a313632373538313531322f7269636b2e6a70673f663d64656661756c7426247024663d32306331626233"
      },
      {
        "id": 8,
        "name": "newCouncilMemberAddress",
        "value": "050a000000160000c2dcc70eb0a95f803bbda8d93449fc7b907bdcc8"
      },
      {
        "id": 9,
        "name": "newCouncilMemberWebsite",
        "value": "05010000001768747470733a2f2f6d617672796b2e66696e616e63652f"
      },
      {
        "id": 10,
        "name": "oldCouncilMemberAddress",
        "value": "050a0000001600004202f4b8b703ac045cae2f4f8a41757010e0af73"
      }
    ]
  },
  {
    "action_type": "propagateBreakGlass",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:19:45+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:19:45+00:00",
    "id": 4,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:19:45+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 4,
        "break_glass_action_id": 4
      }
    ],
    "parameters": []
  },
  {
    "action_type": "setSingleContractAdmin",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:20:00+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:20:00+00:00",
    "id": 5,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:20:00+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 5,
        "break_glass_action_id": 5
      }
    ],
    "parameters": [
      {
        "id": 11,
        "name": "newAdminAddress",
        "value": "050a000000160000d43bce0f8213e3f2eab479417ae926cf11728ef1"
      },
      {
        "id": 12,
        "name": "targetContractAddress",
        "value": "050a0000001601f2c687ee063ed20824519567a80516fe0e934a7100"
      }
    ]
  },
  {
    "action_type": "setAllContractsAdmin",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:20:15+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:20:15+00:00",
    "id": 6,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:20:15+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 6,
        "break_glass_action_id": 6
      }
    ],
    "parameters": [
      {
        "id": 13,
        "name": "newAdminAddress",
        "value": "050a000000160000d43bce0f8213e3f2eab479417ae926cf11728ef1"
      }
    ]
  },
  {
    "action_type": "pauseAllEntrypoints",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:20:30+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:20:30+00:00",
    "id": 7,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:20:30+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 7,
        "break_glass_action_id": 7
      }
    ],
    "parameters": []
  },
  {
    "action_type": "unpauseAllEntrypoints",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:20:45+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:20:45+00:00",
    "id": 8,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:20:45+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 8,
        "break_glass_action_id": 8
      }
    ],
    "parameters": []
  },
  {
    "action_type": "removeBreakGlassControl",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:21:00+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:21:00+00:00",
    "id": 9,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:21:00+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 9,
        "break_glass_action_id": 9
      }
    ],
    "parameters": []
  },
  {
    "action_type": "flushAction",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:21:15+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:21:15+00:00",
    "id": 10,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 0,
    "start_datetime": "2022-10-07T08:21:15+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 10,
        "break_glass_action_id": 10
      }
    ],
    "parameters": [
      {
        "id": 14,
        "name": "actionId",
        "value": "050001"
      }
    ]
  },
  {
    "action_type": "flushAction",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": true,
    "execution_datetime": "2022-10-07T08:21:45+00:00",
    "execution_level": 1294104,
    "expiration_datetime": "2022-10-08T08:21:30+00:00",
    "id": 11,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 2,
    "status": 2,
    "start_datetime": "2022-10-07T08:21:30+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 11,
        "break_glass_action_id": 11
      },
      {
        "signer_id": "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM",
        "id": 12,
        "break_glass_action_id": 11
      }
    ],
    "parameters": [
      {
        "id": 15,
        "name": "actionId",
        "value": "050001"
      }
    ]
  },
  {
    "action_type": "addCouncilMember",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": false,
    "execution_datetime": "2022-10-07T08:19:00+00:00",
    "execution_level": 0,
    "expiration_datetime": "2022-10-08T08:19:00+00:00",
    "id": 1,
    "initiator_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
    "signers_count": 1,
    "status": 1,
    "start_datetime": "2022-10-07T08:19:00+00:00",
    "signers": [
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 1,
        "break_glass_action_id": 1
      }
    ],
    "parameters": [
      {
        "id": 1,
        "name": "councilMemberName",
        "value": "0501000000055472756479"
      },
      {
        "id": 2,
        "name": "councilMemberImage",
        "value": "05010000005d68747470733a2f2f7777772e696865617274726164696f2e63612f696d6167652f706f6c6963793a312e31353733313834343a313632373538313531322f7269636b2e6a70673f663d64656661756c7426247024663d32306331626233"
      },
      {
        "id": 3,
        "name": "councilMemberAddress",
        "value": "050a000000160000c2dcc70eb0a95f803bbda8d93449fc7b907bdcc8"
      },
      {
        "id": 4,
        "name": "councilMemberWebsite",
        "value": "05010000001768747470733a2f2f6d617672796b2e66696e616e63652f"
      }
    ]
  },
  {
    "action_type": "setSingleContractAdmin",
    "break_glass_id": "KT1FwGNXKoVE6GJ68mqK9VuGexySCTWBiTVs",
    "executed": true,
    "execution_datetime": "2022-10-07T10:30:05+00:00",
    "execution_level": 1294578,
    "expiration_datetime": "2022-10-08T10:29:45+00:00",
    "id": 12,
    "initiator_id": "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM",
    "signers_count": 2,
    "status": 2,
    "start_datetime": "2022-10-07T10:29:45+00:00",
    "signers": [
      {
        "signer_id": "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM",
        "id": 13,
        "break_glass_action_id": 12
      },
      {
        "signer_id": "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        "id": 14,
        "break_glass_action_id": 12
      }
    ],
    "parameters": [
      {
        "id": 16,
        "name": "newAdminAddress",
        "value": "050a000000160000d43bce0f8213e3f2eab479417ae926cf11728ef1"
      },
      {
        "id": 17,
        "name": "targetContractAddress",
        "value": "050a0000001601f2c687ee063ed20824519567a80516fe0e934a7100"
      }
    ]
  }
]

export const BreakGlassCouncil: FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    breakGlassCouncilMember,
    breakGlassActionPendingMySignature: x,
    pastBreakGlassCouncilAction,
    myPastBreakGlassCouncilAction,
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
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>(itemsForDropDown[0])

  const [sliderKey, setSliderKey] = useState(1)
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)

  const sortedBreakGlassCouncilMembers = memberIsFirstOfList(breakGlassCouncilMember, accountPkh)
  const { review: isReviewPage } = useParams<{ review: string }>()

  const isUserInBreakCouncilMember = Boolean(breakGlassCouncilMember.find((item) => item.userId === accountPkh)?.id)
  const displayPendingSignature = Boolean(
    !isReviewPage && isUserInBreakCouncilMember && breakGlassActionPendingMySignature?.length,
  )

  const handleClickReview = () => {
    history.replace(`${queryParameters.pathname}${queryParameters.review}`)
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
    if (accountPkh) dispatch(getBreakGlassActionPendingMySignature())
    setSliderKey(sliderKey + 1)
  }, [dispatch, accountPkh])

  useEffect(() => {
    // redirect to review or main page when member changes
    history.replace(isUserInBreakCouncilMember ? queryParameters.pathname : `${queryParameters.pathname}${queryParameters.review}`)
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
          />
        </PropagateBreakGlassCouncilCard>
      )}

      {displayPendingSignature && <h1>Pending Signature</h1>}

      <BreakGlassCouncilStyled>
        <div className="left-block">
          {displayPendingSignature && (
            <article className="pending">
              <div className="pending-items">
                <Carousel itemLength={breakGlassActionPendingMySignature.length} key={sliderKey}>
                  {breakGlassActionPendingMySignature.map((item) => (
                    // @ts-ignore
                    <BreakGlassCouncilPanding
                      {...item}
                      key={item.id}
                      numCouncilMembers={breakGlassCouncilMember.length}
                      councilPendingActionsLength={breakGlassActionPendingMySignature.length}
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

              {Boolean(myPastBreakGlassCouncilAction.length) && (
                <>
                  <h1>My Past Council Actions</h1>
                  {paginatedMyPastCouncilActions.map((item) => (
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
                    itemsCount={myPastBreakGlassCouncilAction.length}
                    listName={BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME}
                  />
                </>
              )}
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
                  website={item.website}
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
          <FormUpdateCouncilMemberView />
        </ModalPopup>
      ) : null}
    </Page>
  )
}
