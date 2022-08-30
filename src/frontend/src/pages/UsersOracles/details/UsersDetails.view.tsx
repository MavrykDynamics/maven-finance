// consts, helpers
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { USER_DATA_FEEDS_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

// types
import { Feed } from 'pages/Satellites/helpers/Satellites.types'

// view
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import SatelliteList from 'pages/Satellites/SatelliteList/SatellitesList.controller'
import UsersPagination from '../pagination/UsersPagination.controler'

// styles
import { Page } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { DataFeedsTitle, DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { UserDetailsStyled } from './UsersDetails.style'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { useState } from 'react'

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)

const itemsForDropDown = [
  { text: 'Cryptocurrencies (USD pairs)', value: 'cryptocurUDS' },
  { text: 'Stablecoins', value: 'stableCoins' },
  { text: 'Cryptocurrencies (BNB pairs)', value: 'cryptocurBNB' },
  { text: 'Proof of Reserve', value: 'proofReserve' },
  { text: 'Indexes', value: 'indexes' },
  { text: 'Cryptocurrencies (ETH pairs)', value: 'cryptocurETH' },
  { text: 'Foreign Exchange', value: 'forExchange' },
  { text: 'Commodities', value: 'commodities' },
  { text: 'Cryptocurrencies (Other)', value: 'cryptocurOther' },
  { text: 'Ethereum Gas', value: 'ethGas' },
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
      <PageHeader page={'data-feeds'} />
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
            isOpen={ddIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
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
