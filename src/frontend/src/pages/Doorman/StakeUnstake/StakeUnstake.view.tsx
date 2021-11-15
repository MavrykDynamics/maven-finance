import { Button } from 'app/App.components/Button/Button.controller'
import { useState } from 'react'
// prettier-ignore
import { StakeUnstakeBalance, StakeUnstakeButtonGrid, StakeUnstakeCard, StakeUnstakeInput, StakeUnstakeInputGrid, StakeUnstakeInputLabel, StakeUnstakeMax, StakeUnstakeMin, StakeUnstakeRate, StakeUnstakeStyled } from './StakeUnstake.style'

type StakeUnstakeViewProps = {
  myMvkBalance?: string
  myVMvkBalance?: string
  handleStake: (amount: number) => void
  handleUnStake: (amount: number) => void
  loading: boolean
}

export const StakeUnstakeView = ({
  myMvkBalance,
  myVMvkBalance,
  handleStake,
  handleUnStake,
  loading,
}: StakeUnstakeViewProps) => {
  // const loading = useSelector((state: State) => state.loading)
  // const dispatch = useDispatch()
  const [inputAmount, setInputAmount] = useState(0)

  const stakeCallback = (amount: number) => {
    handleStake(amount)
  }

  const unStakeCallback = (amount: number) => {
    handleUnStake(amount)
  }

  return (
    <StakeUnstakeStyled>
      <StakeUnstakeCard>
        <StakeUnstakeInputGrid>
          <img src="/images/coin-gold.svg" alt="coin" />
          <div>
            <StakeUnstakeMin>Min 1 MVK</StakeUnstakeMin>
            <StakeUnstakeMax>Use Max</StakeUnstakeMax>
            <StakeUnstakeInput
              type="number"
              value={inputAmount}
              onChange={(e: any) => setInputAmount(e.target.value)}
            />
            <StakeUnstakeInputLabel>MVK</StakeUnstakeInputLabel>
            <StakeUnstakeRate>1 MVK ≈ $0.25</StakeUnstakeRate>
          </div>
        </StakeUnstakeInputGrid>
        <StakeUnstakeButtonGrid>
          <Button text="Stake" icon="in" loading={loading} onClick={() => stakeCallback(inputAmount)} />
          <Button
            text="Unstake"
            icon="out"
            kind="secondary"
            loading={loading}
            onClick={() => unStakeCallback(inputAmount)}
          />
        </StakeUnstakeButtonGrid>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>My MVK Balance</h3>
          <img src="/images/coin-gold.svg" alt="coin" />
          <div>{myMvkBalance} MVK</div>
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>Total MVK Staked</h3>
          <img src="/images/coin-silver.svg" alt="coin" />
          <div>{myVMvkBalance} vMVK</div>
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
