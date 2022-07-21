import React, { useMemo, useState, useCallback } from 'react'
import moment from 'moment'

// consts, helpers
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { PRIMARY } from 'app/App.components/PageHeader/PageHeader.constants'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import {
  ORACLES_DATA_IN_FEED_LIST_NAME,
  USER_DATA_FEEDS_LIST_NAME,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { QUESTION_MARK_SVG_ENCODED, INFO_SVG_ENCODED } from 'pages/Satellites/helpers/Satellites.consts'

// types
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'

// view
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import SatelliteList from 'pages/Satellites/SatelliteList/SatellitesList.controller'
import Chart from 'app/App.components/Chart/Chart.view'
import { Button } from 'app/App.components/Button/Button.controller'
import UsersPagination from '../pagination/UsersPagination.controler'

// styles
import { Page } from 'styles'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { EmptyContainer } from 'app/App.style'
import { DataFeedsTitle, DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { UserDetailsStyled } from './UsersDetails.style'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)

const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

const UserDetailsView = ({
  user,
  isLoading,
  feeds,
  handleSelect,
}: {
  user: any
  isLoading: boolean
  feeds: Feed[]
  handleSelect: (e: any) => void
}) => {
  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  return user ? (
    <Page>
      <PageHeader page={'data-feeds'} kind={PRIMARY} loading={false} />
      <UsersPagination />

      <UserDetailsStyled>
        <div className="top-wrapper">
          <div className="img-wrapper">logo</div>
          <DataFeedsTitle fontSize={25} fontWeidth={600}>
            {user.name}
          </DataFeedsTitle>
        </div>

        <div className="left-side-wrapper">
          {user?.descr && (
            <DataFeedSubTitleText fontSize={14} fontWeidth={400}>
              {user.descr}
            </DataFeedSubTitleText>
          )}
          <div className="bottom">
            <div className="item">
              <h5>Official website</h5>
              <a href={user.website}>
                <var>
                  {user.website}{' '}
                  <svg>
                    <use xlinkHref="/icons/sprites.svg#openLink" />
                  </svg>
                </var>
              </a>
            </div>

            <div className="item">
              <a href="#">
                <h5>
                  Total value locked
                  <svg>
                    <use xlinkHref="/icons/sprites.svg#info" />
                  </svg>
                </h5>
              </a>
              <var>{user.valueLocked}</var>
            </div>

            <div className="item">
              <h5>User since</h5>
              <var>{getDate_MDY_Format(user.creationDate)}</var>
            </div>
          </div>
        </div>
      </UserDetailsStyled>

      <SatelliteSearchFilter oracle>
        <DropdownContainer>
          <h4>Category:</h4>
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
        </DropdownContainer>
      </SatelliteSearchFilter>

      {feeds ? (
        <SatelliteList items={feeds} listType={'userFeeds'} name={USER_DATA_FEEDS_LIST_NAME} loading={isLoading} />
      ) : (
        emptyContainer
      )}
    </Page>
  ) : null
}

export default UserDetailsView
