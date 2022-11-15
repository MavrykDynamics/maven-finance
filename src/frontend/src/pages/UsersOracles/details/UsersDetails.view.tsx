// consts, helpers
import { USER_DATA_FEEDS_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

// types
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'
import { UserType } from '../../../utils/TypesAndInterfaces/User'

// view
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import SatelliteList from 'pages/Satellites/SatelliteList/SatellitesList.controller'
import UsersPagination from '../pagination/UsersPagination.controler'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import Icon from 'app/App.components/Icon/Icon.view'

// styles
import { Page } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { DataFeedsTitle, DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { UserDetailsStyled } from './UsersDetails.style'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { useState } from 'react'
import { parseDate } from 'utils/time'

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)

const UserDetailsView = ({
  user,
  isLoading,
  feeds,
  handleSelect,
  categories,
}: {
  user: UserType | null
  isLoading: boolean
  feeds: FeedGQL[]
  handleSelect: (e: string) => void
  categories: string[]
}) => {
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<string | undefined>()

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleOnClickDropdownItem = (selectedItem: string) => {
    setDdIsOpen(!ddIsOpen)
    setChosenDdItem(selectedItem)
    handleSelect(selectedItem)
  }

  return user ? (
    <Page>
      <PageHeader page={'oracles-users'} />
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
                  <Icon id="send" className='icon-send' />
                </var>
              </a>
            </div>

            <div className="item">
              <a href="#">
                <h5>
                  Total value locked
                  <CustomTooltip
                    className='info-icon'
                    text={`Total value locked (TVL) according to defillama.com TVL represents the sum dollar value of crypto assets locked in a DeFi protocol.           `}
                    iconId={'info'}
                  />
                </h5>
              </a>
              <var>{user.valueLocked}</var>
            </div>

            <div className="item">
              <h5>User since</h5>
              <var>{parseDate({ time: user.creationDate, timeFormat: 'MMM DD, YYYY' })}</var>
            </div>
          </div>
        </div>
      </UserDetailsStyled>

      <SatelliteSearchFilter oracle>
        <DropdownContainer>
          <h4>Category:</h4>
          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder='Choose category'
            isOpen={ddIsOpen}
            setIsOpen={setDdIsOpen}
            itemSelected={chosenDdItem}
            items={categories}
            clickOnItem={handleOnClickDropdownItem}
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
