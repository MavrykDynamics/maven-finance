// prettier-ignore
import { Button } from "app/App.components/Button/Button.controller";
import { StakeUnstakeCard, StakeUnstakeStyled } from './StakeUnstake.style'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { stake } from '../Stake.actions'

type StakeUnstakeViewProps = {}

export const StakeUnstakeView = ({}: StakeUnstakeViewProps) => {
  const loading = useSelector((state: State) => state.loading)
  const dispatch = useDispatch()

  const stakeCallback = () => {
    dispatch(stake())
  }

  return (
    <StakeUnstakeStyled>
      <StakeUnstakeCard>
        <Button text="Stake" loading={loading} onClick={() => stakeCallback()} />
      </StakeUnstakeCard>
      <StakeUnstakeCard>My MVK Balance</StakeUnstakeCard>
      <StakeUnstakeCard>Total MVK Staked</StakeUnstakeCard>
      <StakeUnstakeCard>Total MVK Earned</StakeUnstakeCard>
    </StakeUnstakeStyled>
  )
}
