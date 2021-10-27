import { Button } from 'app/App.components/Button/Button.controller'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { stake } from '../Stake.actions'
// prettier-ignore
import { StakeUnstakeBalance, StakeUnstakeButtonGrid, StakeUnstakeCard, StakeUnstakeInput, StakeUnstakeInputGrid, StakeUnstakeInputLabel, StakeUnstakeMax, StakeUnstakeMin, StakeUnstakeRate, StakeUnstakeStyled } from './StakeUnstake.style'

type StakeUnstakeViewProps = { myMvkBalance: any }

export const StakeUnstakeView = ({ myMvkBalance }: StakeUnstakeViewProps) => {
  const loading = useSelector((state: State) => state.loading)
  const dispatch = useDispatch()

  const stakeCallback = () => {
    dispatch(stake())
  }

  return (
    <StakeUnstakeStyled>
      <StakeUnstakeCard>
        <StakeUnstakeInputGrid>
          <img src="/images/coin-gold.svg" alt="coin" />
          <div>
            <StakeUnstakeMin>Min 1 MVK</StakeUnstakeMin>
            <StakeUnstakeMax>Use Max</StakeUnstakeMax>
            <StakeUnstakeInput />
            <StakeUnstakeInputLabel>MVK</StakeUnstakeInputLabel>
            <StakeUnstakeRate>1 MVK ≈ $0.25</StakeUnstakeRate>
          </div>
        </StakeUnstakeInputGrid>
        <StakeUnstakeButtonGrid>
          <Button text="Stake" icon="in" loading={loading} onClick={() => stakeCallback()} />
          <Button text="Unstake" icon="out" kind="secondary" loading={loading} onClick={() => stakeCallback()} />
        </StakeUnstakeButtonGrid>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>My MVK Balance</h3>
          <img src="/images/coin-gold.svg" alt="coin" />
          <div>{myMvkBalance?.toFixed(2)} MVK</div>
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>Total MVK Staked</h3>
          <img src="/images/coin-silver.svg" alt="coin" />
          <div>0 MVK</div>
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>Total MVK Earned</h3>
          <img src="/images/coin-bronze.svg" alt="coin" />
          <div>0 MVK</div>
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
    </StakeUnstakeStyled>
  )
}
