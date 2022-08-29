import { PRIMARY } from 'app/App.components/Modal/Modal.constants'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { DataFeedsTitle, DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { Link } from 'react-router-dom'
import { Page } from 'styles'
import { UserCardWrapper, UsersListWrapper, UsersStyled } from './Users.styles'

const UsersView = ({ users }: { users: any }) => {
  return (
    <Page>
      <PageHeader page={'data-feeds'} kind={PRIMARY} loading={false} />

      <UsersStyled>
        <GovRightContainerTitleArea>
          <h1>Users</h1>
        </GovRightContainerTitleArea>

        <UsersListWrapper>
          {users.map((user: any) => (
            <Link to={`/satellites/user-details/${user.id}`}>
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
                <Link to={`/satellites/user-details/${user.id}`}>
                  <DataFeedsTitle fontSize={14} fontWeidth={400} className="link">
                    View {user.name} feeds
                  </DataFeedsTitle>
                </Link>
              </UserCardWrapper>
            </Link>
          ))}
        </UsersListWrapper>
      </UsersStyled>
    </Page>
  )
}

export default UsersView
