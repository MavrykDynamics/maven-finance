// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../app/App.components/Button/Button.constants'
import { Input } from '../../../app/App.components/Input/Input.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StakeUnstakeForm, StakeUnstakeFormInputStatus } from '../../../utils/TypesAndInterfaces/Forms'
// helpers
import { isValidNumberValue, mathRoundTwoDigit, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
import { setExitFeeAmount } from '../ExitFeeModal/ExitFeeModal.actions'

// style
import {
  StakeLabel,
  StakeUnstakeActionCard,
  StakeUnstakeBalance,
  StakeUnstakeButtonGrid,
  StakeUnstakeCard,
  StakeUnstakeInputColumn,
  StakeUnstakeInputGrid,
  StakeUnstakeInputLabels,
  StakeUnstakeMax,
  StakeUnstakeMin,
  StakeUnstakeRate,
  StakeUnstakeStyled,
} from './StakeUnstake.style'
import { rewardsCompound } from '../Doorman.actions'

type StakeUnstakeViewProps = {
  stakeCallback: (amount: number) => void
  unstakeCallback: (amount: number) => void
}

export const StakeUnstakeView = ({ stakeCallback, unstakeCallback }: StakeUnstakeViewProps) => {
  const dispatch = useDispatch()
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    myDoormanRewardsData: { myAvailableDoormanRewards = 0 } = {},
    mySatelliteRewardsData: { myAvailableSatelliteRewards = 0 } = {},
    myMvkTokenBalance = 0,
    mySMvkTokenBalance = 0,
  } = useSelector((state: State) => state.user)
  const { amount, showing } = useSelector((state: State) => state.exitFeeModal)
  const [inputAmount, setInputAmount] = useState<StakeUnstakeForm>({ amount: 0 })
  const [stakeUnstakeInputStatus, setStakeUnstakeInputStatus] = useState<StakeUnstakeFormInputStatus>({ amount: '' })
  const [stakeUnstakeValueError, setStakeUnstakeValueError] = useState('')

  const exchangeValue = exchangeRate && inputAmount.amount ? inputAmount.amount * exchangeRate : 0
  const earnedValue = myAvailableSatelliteRewards + myAvailableDoormanRewards

  const inputAmountValue = +inputAmount.amount
  const userHasRewards = myAvailableDoormanRewards + myAvailableSatelliteRewards > 2
  const isSuccess = stakeUnstakeInputStatus.amount === 'success'

  const onUseMaxClick = (actionType: string) => {
    switch (actionType) {
      case 'STAKE':
        setInputAmount({ amount: mathRoundTwoDigit(myMvkTokenBalance) })
        dispatch(setExitFeeAmount(Number(mathRoundTwoDigit(myMvkTokenBalance))))
        break
      case 'UNSTAKE':
      default:
        setInputAmount({ amount: mathRoundTwoDigit(mySMvkTokenBalance) })
        dispatch(setExitFeeAmount(Number(mathRoundTwoDigit(mySMvkTokenBalance))))
        break
    }
  }

  const checkInputIsOk = (value: number | '') => {
    let validityCheckResult = false
    setStakeUnstakeValueError('')
    if (accountPkh) {
      validityCheckResult = isValidNumberValue(
        +value,
        1,
        Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)),
      )
    } else {
      validityCheckResult = isValidNumberValue(+value, 1)
    }

    const status = value === '' ? '' : validityCheckResult ? 'success' : 'error'
    setStakeUnstakeInputStatus({ amount: status })
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = mathRoundTwoDigit(e.target.value)

    checkInputIsOk(Number(value))
    setInputAmount({ amount: value })
  }

  useEffect(() => {
    checkInputIsOk(amount || '')
    setInputAmount({ amount: mathRoundTwoDigit(amount) })
  }, [amount, accountPkh, showing])

  const handleStakeUnstakeClick = (actionType: string) => {
    let validityCheckResult = isValidNumberValue(inputAmountValue, 1)
    if (!validityCheckResult) setStakeUnstakeValueError('Stake/Unstake value must be 1 or more')
    if (accountPkh) {
      if (actionType === 'STAKE') {
        validityCheckResult = isValidNumberValue(inputAmountValue, 1, Number(myMvkTokenBalance))
      } else {
        validityCheckResult = isValidNumberValue(inputAmountValue, 1, Number(mySMvkTokenBalance))
      }
    }
    setStakeUnstakeInputStatus({ amount: validityCheckResult ? 'success' : 'error' })

    let inputIsValid = false
    switch (actionType) {
      case 'STAKE':
        inputIsValid = validateFormAndThrowErrors(dispatch, { amount: isSuccess })
        if (inputIsValid) stakeCallback(inputAmountValue)
        break
      case 'UNSTAKE':
      default:
        inputIsValid = validateFormAndThrowErrors(dispatch, { amount: isSuccess })
        if (inputIsValid) unstakeCallback(inputAmountValue)
        break
    }
  }

  const handleCompound = () => {
    if (accountPkh) {
      dispatch(rewardsCompound(accountPkh))
    }
  }

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (+value === 0) {
      setInputAmount({ amount: '' })
    }
  }

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (+value === 0) {
      checkInputIsOk('')
    }

    if (value === '') {
      checkInputIsOk('')
      setInputAmount({ amount: 0 })
    }
  }

  return (
    <StakeUnstakeStyled>
      <StakeUnstakeActionCard>
        <StakeUnstakeInputGrid>
          <img src="/images/coin-gold.svg" alt="coin" />
          <StakeUnstakeInputColumn>
            <StakeUnstakeInputLabels>
              <StakeUnstakeMin>Min 1 MVK</StakeUnstakeMin>
              {accountPkh && (
                <>
                  <StakeUnstakeMax onClick={() => onUseMaxClick('UNSTAKE')}>Max Unstake</StakeUnstakeMax>
                  <StakeUnstakeMax onClick={() => onUseMaxClick('STAKE')}>Max Stake</StakeUnstakeMax>
                </>
              )}
            </StakeUnstakeInputLabels>
            <Input
              type={'number'}
              placeholder={String(inputAmount.amount)}
              onChange={onInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              value={inputAmount.amount}
              pinnedText={'MVK'}
              inputStatus={stakeUnstakeInputStatus.amount}
              errorMessage={stakeUnstakeValueError}
            />
            <StakeUnstakeRate>
              <CommaNumber value={Number(exchangeValue ? inputAmount.amount : 1)} endingText={'MVK'} />
              <span>&nbsp;= $</span>
              <CommaNumber value={Number(exchangeValue || exchangeRate)} endingText={''} />
            </StakeUnstakeRate>
          </StakeUnstakeInputColumn>
        </StakeUnstakeInputGrid>
        <StakeUnstakeButtonGrid className={`${userHasRewards ? 'compound' : ''}`}>
          {userHasRewards ? (
            <Button text="Compound" className="fill" kind={ACTION_PRIMARY} icon="compound" onClick={handleCompound} />
          ) : null}
          <Button
            text="Unstake"
            icon="out"
            kind={ACTION_SECONDARY}
            onClick={() => handleStakeUnstakeClick('UNSTAKE')}
          />
          <Button text="Stake" kind={ACTION_PRIMARY} icon="in" onClick={() => handleStakeUnstakeClick('STAKE')} />
        </StakeUnstakeButtonGrid>
        {userHasRewards ? (
          <p className="compound-info">
            Compounds the satellite rewards along with the exit fee{' '}
            <a className="info-link" href="https://mavryk.finance/litepaper#abstract" target="_blank" rel="noreferrer">
              <Icon id="question" />
            </a>
          </p>
        ) : null}
      </StakeUnstakeActionCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>My MVK Balance</h3>
          {myMvkTokenBalance === 0 ? <StakeLabel>Not Staking</StakeLabel> : null}
          <img src="/images/coin-gold.svg" alt="coin" />
          <CommaNumber value={Number(myMvkTokenBalance || 0)} endingText={'MVK'} />
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>Total MVK Staked</h3>
          <img src="/images/coin-silver.svg" alt="coin" />
          <CommaNumber value={Number(mySMvkTokenBalance || 0)} endingText={'MVK'} />
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
      <StakeUnstakeCard>
        <StakeUnstakeBalance>
          <h3>Total MVK Earned</h3>
          <img src="/images/coin-bronze.svg" alt="coin" />
          <CommaNumber value={earnedValue} endingText={'MVK'} />
        </StakeUnstakeBalance>
      </StakeUnstakeCard>
    </StakeUnstakeStyled>
  )
}
