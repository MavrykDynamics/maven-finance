import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { MyRewardsStyled } from './DashboardPersonalComponents.style'

type DashboardPersonalMyRewardsProps = {
  earnedRewards: number
  rewardsToClaim: number
  claimRewardsHandler: () => void
}

const DashboardPersonalMyRewards = ({
  earnedRewards,
  rewardsToClaim,
  claimRewardsHandler,
}: DashboardPersonalMyRewardsProps) => {
  return (
    <MyRewardsStyled>
      <GovRightContainerTitleArea>
        <h1>My MVK Earnings</h1>
      </GovRightContainerTitleArea>
      <Button kind={ACTION_PRIMARY} text="Claim Rewards" onClick={claimRewardsHandler} />
      <div className="stat-block">
        <div className="name">Earned to Date</div>
        <div className="value">
          <CommaNumber value={earnedRewards} endingText="sMVK" />
        </div>
      </div>
      <div className="stat-block">
        <div className="name">Claimable Rewards</div>
        <div className="value">
          <CommaNumber value={rewardsToClaim} endingText="sMVK" />
        </div>
      </div>
    </MyRewardsStyled>
  )
}

export default DashboardPersonalMyRewards
