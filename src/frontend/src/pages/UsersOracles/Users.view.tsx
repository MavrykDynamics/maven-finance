import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { DataFeedsTitle, DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { Link } from 'react-router-dom'
import { Page } from 'styles'
import { UserCardWrapper, UsersListWrapper, UsersStyled } from './Users.styles'
import { UserType } from '../../utils/TypesAndInterfaces/User'

const UsersView = ({ users }: { users: UserType[] }) => {
  return (
    <Page>
      <PageHeader page={'oracles-users'} />

      <UsersStyled>
        <GovRightContainerTitleArea>
          <h1>Users</h1>
        </GovRightContainerTitleArea>

        <UsersListWrapper>
          {users.map((user) => (
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
