import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { useState } from 'react'

// prettier-ignore
import {
  StakeUnstakeActionCard,
  StakeUnstakeBalance,
  StakeUnstakeButtonGrid,
  StakeUnstakeCard, StakeUnstakeErrorMessage,
  StakeUnstakeInput,
  StakeUnstakeInputCheck, StakeUnstakeInputColumn,
  StakeUnstakeInputGrid,
  StakeUnstakeInputLabel,
  StakeUnstakeMax,
  StakeUnstakeMin,
  StakeUnstakeRate,
  StakeUnstakeStyled,
} from './StakeUnstake.style'

type StakeUnstakeViewProps = {
  myMvkTokenBalance?: string
  userStakeBalance?: string
  stakeCallback: (amount: number) => void
  unstakeCallback: (amount: number) => void
  loading: boolean
  accountPkh?: string
}

export const StakeUnstakeView = ({
  myMvkTokenBalance,
  userStakeBalance,
  stakeCallback,
  unstakeCallback,
  loading,
  accountPkh,
}: StakeUnstakeViewProps) => {
  const [inputAmount, setInputAmount] = useState(1)
  const [stakeUnstakeValueOK, setStakeUnstakeValueOK] = useState(true)
  const [stakeUnstakeValueError, setStakeUnstakeValueError] = useState('')

  const onUseMaxClick = (actionType: string) => {
    switch (actionType) {
      case 'STAKE':
        setInputAmount(Number(myMvkTokenBalance))
        break
      case 'UNSTAKE':
      default:
        setInputAmount(Number(userStakeBalance))
        break
    }
  }
  const checkInputIsOk = () => {
    if (Number(inputAmount) && inputAmount >= 1) {
      setStakeUnstakeValueOK(true)
    } else if (accountPkh) {
      setStakeUnstakeValueOK(false)
    }
  }

  const onInputChange = (e: any) => {
    setInputAmount(e.target.value)
    checkInputIsOk()
  }

  const handleStakeUnstakeClick = (actionType: string) => {
    if (!Number(inputAmount)) {
      setStakeUnstakeValueError('Stake/Unstake value is not a valid number')
      setStakeUnstakeValueOK(false)
    } else if (inputAmount < 1) {
      setStakeUnstakeValueError('Stake/Unstake value must be 1 or more')
      setStakeUnstakeValueOK(false)
    } else if (accountPkh && inputAmount > Number(myMvkTokenBalance) && actionType === 'STAKE') {
      setStakeUnstakeValueOK(false)
      setStakeUnstakeValueError('Stake value cannot exceed your MVK balance')
    } else if (accountPkh && inputAmount > Number(userStakeBalance) && actionType === 'UNSTAKE') {
      setStakeUnstakeValueError('Unstake value cannot exceed your Total MVK Staked')
      setStakeUnstakeValueOK(false)
    } else {
      switch (actionType) {
        case 'STAKE':
          stakeCallback(inputAmount)
          break
        case 'UNSTAKE':
        default:
          unstakeCallback(inputAmount)
          break
      }
    }
  }
  return (
    <StakeUnstakeStyled>
      <StakeUnstakeActionCard>
        <StakeUnstakeInputGrid>
          <img src="/images/coin-gold.svg" alt="coin" />
          <StakeUnstakeInputColumn>
            <div>
              <StakeUnstakeMin>Min 1 MVK</StakeUnstakeMin>
              <StakeUnstakeMax onClick={() => onUseMaxClick('UNSTAKE')}>Max Unstake</StakeUnstakeMax>
              <StakeUnstakeMax onClick={() => onUseMaxClick('STAKE')}>Max Stake</StakeUnstakeMax>
            </div>
            <StakeUnstakeInputCheck inputOk={stakeUnstakeValueOK} accountPkh={accountPkh}>
              <StakeUnstakeInput type="number" value={inputAmount} onChange={onInputChange} />
              <StakeUnstakeInputLabel>MVK</StakeUnstakeInputLabel>
            </StakeUnstakeInputCheck>
            <StakeUnstakeErrorMessage inputOk={stakeUnstakeValueOK} accountPkh={accountPkh}>
              {stakeUnstakeValueError}
            </StakeUnstakeErrorMessage>
            <StakeUnstakeRate>1 MVK ≈ $0.25</StakeUnstakeRate>
          </StakeUnstakeInputColumn>
        </StakeUnstakeInputGrid>
        <StakeUnstakeButtonGrid>
          <Button text="Stake" icon="in" loading={loading} onClick={() => handleStakeUnstakeClick('STAKE')} />
          <Button
            text="Unstake"
            icon="out"
            kind="secondary"
            loading={loading}
            onClick={() => handleStakeUnstakeClick('UNSTAKE')}
          />
        </StakeUnstakeButtonGrid>
      </StakeUnstakeActionCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>My MVK Balance</h3>
          <img src="/images/coin-gold.svg" alt="coin" />
          <CommaNumber value={Number(myMvkTokenBalance || 0)} loading={loading} endingText={'MVK'} />
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>My Staked MVK</h3>
          <img src="/images/coin-silver.svg" alt="coin" />
          <CommaNumber value={Number(userStakeBalance || 0)} loading={loading} endingText={'MVK'} />
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>My Earned MVK</h3>
          <img src="/images/coin-bronze.svg" alt="coin" />
          <CommaNumber value={Number(0)} loading={loading} endingText={'MVK'} />
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
    </StakeUnstakeStyled>
  )
}
