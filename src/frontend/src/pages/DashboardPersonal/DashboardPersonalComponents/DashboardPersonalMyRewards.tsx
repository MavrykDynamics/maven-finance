import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { MyRewardsStyled } from './DashboardPersonalComponents.style'

const DashboardPersonalMyRewards = () => {
  return (
    <MyRewardsStyled>
      <GovRightContainerTitleArea>
        <h1>My MVK Earnings</h1>
      </GovRightContainerTitleArea>
      <Button kind={ACTION_PRIMARY} text="Claim Rewards" />
    </MyRewardsStyled>
  )
}

export default DashboardPersonalMyRewards
