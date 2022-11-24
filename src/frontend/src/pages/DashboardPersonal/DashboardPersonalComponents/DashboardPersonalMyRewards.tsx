import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { MyRewardsStyled } from './DashboardPersonalComponents.style'

const DashboardPersonalMyRewards = () => {
  return (
    <MyRewardsStyled>
      <GovRightContainerTitleArea>
        <h1>My MVK Earnings</h1>
      </GovRightContainerTitleArea>
      <Button kind={ACTION_PRIMARY} text="Claim Rewards" />
      <div className="stat-block">
        <div className="name">Earned to Date</div>
        <div className="value">
          <CommaNumber value={12311.21} endingText="sMVK" />
        </div>
      </div>
      <div className="stat-block">
        <div className="name">Claimable Rewards</div>
        <div className="value">
          <CommaNumber value={122211.21} endingText="sMVK" />
        </div>
      </div>
    </MyRewardsStyled>
  )
}

export default DashboardPersonalMyRewards
