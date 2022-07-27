import { PRIMARY } from 'app/App.components/Modal/Modal.constants'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { DataFeedsTitle, DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import React from 'react'
import { useHistory } from 'react-router'
import { Page } from 'styles'
import { UserCardWrapper, UsersListWrapper, UsersStyled } from './Users.styles'

const UsersView = ({ users }: { users: any }) => {
  const history = useHistory()
  return (
    <Page>
      <PageHeader page={'data-feeds'} kind={PRIMARY} loading={false} />

      <UsersStyled>
        <GovRightContainerTitleArea>
          <h1>Users</h1>
        </GovRightContainerTitleArea>

        <UsersListWrapper>
          {users.map((user: any) => (
            <UserCardWrapper key={user.id}>
              <div className="top-wrapper">
                <div className="img-wrapper">logo</div>
                <DataFeedsTitle fontSize={25} fontWeidth={600}>
                  {user.name}
                </DataFeedsTitle>
              </div>
              <DataFeedSubTitleText fontSize={16} fontWeidth={400} className="descr">
                {user.descr}
              </DataFeedSubTitleText>
              <DataFeedsTitle
                fontSize={14}
                fontWeidth={400}
                className="link"
                onClick={() => history.push(`/user-details/${user.id}`)}
              >
                View {user.name} feeds
              </DataFeedsTitle>
            </UserCardWrapper>
          ))}
        </UsersListWrapper>
      </UsersStyled>
    </Page>
  )
}

export default UsersView
