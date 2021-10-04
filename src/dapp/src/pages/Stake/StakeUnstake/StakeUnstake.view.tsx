// prettier-ignore
import { Button } from "app/App.components/Button/Button.controller";
import { useState } from 'react'
import { StakeUnstakeCard, StakeUnstakeStyled } from './StakeUnstake.style'

type StakeUnstakeViewProps = {}

export const StakeUnstakeView = ({}: StakeUnstakeViewProps) => {
  const [loading, setLoading] = useState(false)

  return (
    <StakeUnstakeStyled>
      <StakeUnstakeCard>
        <Button text="Stake" loading={loading} onClick={() => setLoading(true)} />
      </StakeUnstakeCard>
      <StakeUnstakeCard>My MVK Balance</StakeUnstakeCard>
      <StakeUnstakeCard>Total MVK Staked</StakeUnstakeCard>
      <StakeUnstakeCard>Total MVK Earned</StakeUnstakeCard>
    </StakeUnstakeStyled>
  )
}
