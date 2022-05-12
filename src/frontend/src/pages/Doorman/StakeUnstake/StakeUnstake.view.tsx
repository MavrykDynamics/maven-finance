// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../app/App.components/Button/Button.constants'
import { Input } from '../../../app/App.components/Input/Input.controller'
// prettier-ignore
import { StakeUnstakeForm, StakeUnstakeFormInputStatus, ValidStakeUnstakeForm } from '../../../utils/TypesAndInterfaces/Forms'
// helpers
// prettier-ignore
import { isValidNumberValue, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
// actions
import { rewardsCompound } from './StakeUnstake.actions'
// style
// prettier-ignore
import { StakeCompound, StakeLabel, StakeUnstakeActionCard, StakeUnstakeBalance, StakeUnstakeButtonGrid, StakeUnstakeCard, StakeUnstakeInputColumn, StakeUnstakeInputGrid, StakeUnstakeInputLabels, StakeUnstakeMax, StakeUnstakeMin, StakeUnstakeRate, StakeUnstakeStyled } from './StakeUnstake.style'

type StakeUnstakeViewProps = {
  myMvkTokenBalance?: number
  userStakeBalance?: number
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
  const dispatch = useDispatch()
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const { user } = useSelector((state: State) => state.user)
  const { amount, showing } = useSelector((state: State) => state.exitFeeModal)
  const [inputAmount, setInputAmount] = useState<StakeUnstakeForm>({ amount: 0 })
  const [stakeUnstakeValueOK, setStakeUnstakeValueOK] = useState<ValidStakeUnstakeForm>({ amount: false })
  const [stakeUnstakeInputStatus, setStakeUnstakeInputStatus] = useState<StakeUnstakeFormInputStatus>({ amount: '' })
  const [stakeUnstakeValueError, setStakeUnstakeValueError] = useState('')

  const participationFeesPerShare = user.participationFeesPerShare ?? 0
  const exchangeValue = exchangeRate && inputAmount.amount ? inputAmount.amount * exchangeRate : 0
  const earnedValue = 0

  const onUseMaxClick = (actionType: string) => {
    switch (actionType) {
      case 'STAKE':
        setInputAmount({ amount: Number(myMvkTokenBalance) })
        break
      case 'UNSTAKE':
      default:
        setInputAmount({ amount: Number(userStakeBalance) })
        break
    }
  }

  const checkInputIsOk = (value: number) => {
    let validityCheckResult = false
    setStakeUnstakeValueError('')
    if (accountPkh) {
      validityCheckResult = isValidNumberValue(value, 1, Math.max(Number(myMvkTokenBalance), Number(userStakeBalance)))
    } else {
      validityCheckResult = isValidNumberValue(value, 1)
    }
    setStakeUnstakeValueOK({ amount: validityCheckResult })
    setStakeUnstakeInputStatus({ amount: validityCheckResult ? 'success' : 'error' })
  }

  const onInputChange = (e: any) => {
    checkInputIsOk(+e.target.value)
    setInputAmount({ amount: e.target.value })
  }

  useEffect(() => {
    setInputAmount({ amount: Number(amount) })
  }, [amount])

  useEffect(() => {
    if (inputAmount.amount) checkInputIsOk(inputAmount.amount)
  }, [accountPkh, showing])

  const handleStakeUnstakeClick = (actionType: string) => {
    let validityCheckResult = isValidNumberValue(inputAmount.amount, 1)
    if (!validityCheckResult) setStakeUnstakeValueError('Stake/Unstake value must be 1 or more')
    if (accountPkh) {
      if (actionType === 'STAKE') {
        validityCheckResult = isValidNumberValue(inputAmount.amount, 1, Number(myMvkTokenBalance))
      } else {
        validityCheckResult = isValidNumberValue(inputAmount.amount, 1, Number(userStakeBalance))
      }
    }
    setStakeUnstakeValueOK({ amount: validityCheckResult })
    setStakeUnstakeInputStatus({ amount: validityCheckResult ? 'success' : 'error' })

    switch (actionType) {
      case 'STAKE':
        handleStakeAction()
        // stakeCallback(inputAmount.amount)
        break
      case 'UNSTAKE':
      default:
        handleUnstakeAction()
        // unstakeCallback(inputAmount.amount)
        break
    }
    // if (!Number(inputAmount)) {
    //   setStakeUnstakeInputStatus('error')
    //   setStakeUnstakeValueError('Stake/Unstake value is not a valid number')
    //   setStakeUnstakeValueOK(false)
    // } else if (inputAmount < 1) {
    //   setStakeUnstakeInputStatus('error')
    //   setStakeUnstakeValueError('Stake/Unstake value must be 1 or more')
    //   setStakeUnstakeValueOK(false)
    // } else if (accountPkh && inputAmount > Number(myMvkTokenBalance) && actionType === 'STAKE') {
    //   setStakeUnstakeInputStatus('error')
    //   setStakeUnstakeValueError('Stake value cannot exceed your MVK balance')
    //   setStakeUnstakeValueOK(false)
    // } else if (accountPkh && inputAmount > Number(userStakeBalance) && actionType === 'UNSTAKE') {
    //   setStakeUnstakeInputStatus('error')
    //   setStakeUnstakeValueError('Unstake value cannot exceed your Total MVK Staked')
    //   setStakeUnstakeValueOK(false)
    // } else {
    //   setStakeUnstakeInputStatus('success')
    //   switch (actionType) {
    //     case 'STAKE':
    //       handleStakeAction()
    //       // stakeCallback(inputAmount.amount)
    //       break
    //     case 'UNSTAKE':
    //     default:
    //       handleUnstakeAction()
    //       // unstakeCallback(inputAmount.amount)
    //       break
    //   }
    // }
  }

  const handleStakeAction = () => {
    const inputIsValid = validateFormAndThrowErrors(dispatch, stakeUnstakeValueOK)
    if (inputIsValid) stakeCallback(inputAmount.amount)
  }
  const handleUnstakeAction = () => {
    const inputIsValid = validateFormAndThrowErrors(dispatch, stakeUnstakeValueOK)
    if (inputIsValid) unstakeCallback(inputAmount.amount)
  }

  const handleCompound = () => {
    dispatch(rewardsCompound())
  }

  return (
    <StakeUnstakeStyled>
      <StakeUnstakeActionCard>
        <StakeUnstakeInputGrid>
          <img src="/images/coin-gold.svg" alt="coin" />
          <StakeUnstakeInputColumn>
            <StakeUnstakeInputLabels>
              <StakeUnstakeMin>Min 1 MVK</StakeUnstakeMin>
              <StakeUnstakeMax onClick={() => onUseMaxClick('UNSTAKE')}>Max Unstake</StakeUnstakeMax>
              <StakeUnstakeMax onClick={() => onUseMaxClick('STAKE')}>Max Stake</StakeUnstakeMax>
            </StakeUnstakeInputLabels>
            <Input
              type={'number'}
              placeholder={String(inputAmount.amount)}
              onChange={onInputChange}
              onBlur={(e) => checkInputIsOk(+e.target.value)}
              value={inputAmount.amount}
              pinnedText={'MVK'}
              inputStatus={stakeUnstakeInputStatus.amount}
              errorMessage={stakeUnstakeValueError}
            />
            <StakeUnstakeRate>
              <CommaNumber
                value={Number(exchangeValue ? inputAmount.amount : 1)}
                loading={loading}
                endingText={'MVK'}
              />
              <span>&nbsp;= $</span>
              <CommaNumber value={Number(exchangeValue || exchangeRate)} loading={loading} endingText={''} />
            </StakeUnstakeRate>
          </StakeUnstakeInputColumn>
        </StakeUnstakeInputGrid>
        <StakeUnstakeButtonGrid>
          <Button
            text="Stake"
            kind={ACTION_PRIMARY}
            icon="in"
            loading={loading}
            onClick={() => handleStakeUnstakeClick('STAKE')}
          />
          <Button
            text="Unstake"
            icon="out"
            kind={ACTION_SECONDARY}
            loading={loading}
            onClick={() => handleStakeUnstakeClick('UNSTAKE')}
          />
        </StakeUnstakeButtonGrid>
      </StakeUnstakeActionCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>My MVK Balance</h3>
          {myMvkTokenBalance === 0 && !loading ? <StakeLabel>Not Staking</StakeLabel> : null}
          <img src="/images/coin-gold.svg" alt="coin" />
          <CommaNumber value={Number(myMvkTokenBalance || 0)} loading={loading} endingText={'MVK'} />
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>Total MVK Staked</h3>
          <img src="/images/coin-silver.svg" alt="coin" />
          <CommaNumber value={Number(userStakeBalance || 0)} loading={loading} endingText={'MVK'} />
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>Total MVK Earned</h3>
          {participationFeesPerShare ? (
            <StakeCompound onClick={handleCompound}>
              <span>Rewards Available COMPOUND!</span>
              <img src="/images/coins-stack.svg" alt="Compound" />
            </StakeCompound>
          ) : (
            <>
              <img src="/images/coin-bronze.svg" alt="coin" />
              <CommaNumber value={earnedValue} loading={loading} endingText={'MVK'} />
            </>
          )}
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
    </StakeUnstakeStyled>
  )
}
