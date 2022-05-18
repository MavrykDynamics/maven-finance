import { Button } from 'app/App.components/Button/Button.controller'
import * as PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../app/App.components/Button/Button.constants'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
// prettier-ignore
import { StakeUnstakeForm, StakeUnstakeFormInputStatus, ValidStakeUnstakeForm } from '../../../utils/TypesAndInterfaces/Forms'
// helpers
// prettier-ignore
import { isValidNumberValue, mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { DoormanList } from '../DoormanStats/DoormanStats.style'
import { setExitFeeAmount } from './ExitFeeModal.actions'
import { ExitFeeModalButtons, ExitFeeModalContent, ExitFeeModalFee, ExitFeeModalGrid } from './ExitFeeModal.style'

type ExitFeeModalViewProps = {
  loading: boolean
  showing: boolean
  unstakeCallback: (amount: number) => void
  cancelCallback: () => void
  mvkTotalSupply?: number
  totalStakedMvkSupply?: number
  amount: number
}

export const ExitFeeModalView = ({
  loading,
  showing,
  unstakeCallback,
  cancelCallback,
  mvkTotalSupply,
  totalStakedMvkSupply,
  amount,
}: ExitFeeModalViewProps) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const mvkTokens = mvkTotalSupply ?? 0
  const stakedMvkTokens = totalStakedMvkSupply ?? 0
  const mli = calcMLI(mvkTotalSupply, totalStakedMvkSupply)
  const fee = calcExitFee(mvkTotalSupply, totalStakedMvkSupply)
  const [inputAmount, setInputAmount] = useState<StakeUnstakeForm>({ amount: 0 })
  const [stakeUnstakeValueOK, setStakeUnstakeValueOK] = useState<ValidStakeUnstakeForm>({ amount: false })
  const [stakeUnstakeInputStatus, setStakeUnstakeInputStatus] = useState<StakeUnstakeFormInputStatus>({ amount: '' })
  const [stakeUnstakeValueError, setStakeUnstakeValueError] = useState('')
  const { user } = useSelector((state: State) => state.user)
  const inputAmountValue = +inputAmount.amount
  const myMvkTokenBalance = user?.myMvkTokenBalance
  const userStakeBalance = user?.mySMvkTokenBalance

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
    const value = mathRoundTwoDigit(e.target.value)
    checkInputIsOk(+value)

    setInputAmount({ amount: value })
  }

  useEffect(() => {
    checkInputIsOk(amount)
    setInputAmount({ amount })
  }, [amount])

  const handleFocus = (e: any) => {
    const value = e.target.value

    if (+value === 0) {
      setInputAmount({ amount: '' })
    }
  }

  return (
    <ModalStyled showing={showing}>
      {showing && (
        <>
          <ModalMask
            showing={showing}
            onClick={() => {
              dispatch(setExitFeeAmount(inputAmountValue))
              cancelCallback()
            }}
          />
          <ModalCard>
            <ModalClose
              onClick={() => {
                dispatch(setExitFeeAmount(inputAmountValue))
                cancelCallback()
              }}
            >
              <svg>
                <use xlinkHref="/icons/sprites.svg#error" />
              </svg>
            </ModalClose>
            <ModalCardContent style={{ width: 586 }}>
              <h1>Exit Fee</h1>
              <ExitFeeModalContent>
                <label>Amount to Unstake:</label>
                <Input
                  type={'number'}
                  onChange={onInputChange}
                  onBlur={() => checkInputIsOk(inputAmountValue)}
                  value={inputAmount.amount}
                  onFocus={handleFocus}
                  pinnedText={'MVK'}
                  inputStatus={stakeUnstakeInputStatus.amount}
                  errorMessage={stakeUnstakeValueError}
                />
                <DoormanList>
                  <div>
                    <h4>
                      MVK Loyalty Index
                      <a
                        href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon id="question" />
                      </a>
                    </h4>
                    <var>
                      <CommaNumber value={mli} loading={loading} endingText={' '} />
                    </var>
                  </div>
                  <div>
                    <h4>
                      Exit Fee
                      <a
                        href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon id="question" />
                      </a>
                    </h4>
                    <var>
                      <CommaNumber value={fee} loading={loading} endingText={'%'} />
                    </var>
                  </div>
                </DoormanList>

                <ExitFeeModalButtons>
                  <Button
                    text="Cancel"
                    kind={ACTION_SECONDARY}
                    icon="error"
                    loading={loading}
                    onClick={() => {
                      dispatch(setExitFeeAmount(inputAmountValue))
                      cancelCallback()
                    }}
                  />
                  <Button
                    text="Proceed"
                    icon="success"
                    disabled={!stakeUnstakeValueOK.amount}
                    kind={ACTION_PRIMARY}
                    loading={loading}
                    onClick={() => {
                      dispatch(setExitFeeAmount(inputAmountValue))
                      unstakeCallback(inputAmountValue)
                    }}
                  />
                </ExitFeeModalButtons>
              </ExitFeeModalContent>
            </ModalCardContent>
          </ModalCard>
        </>
      )}
    </ModalStyled>
  )
}

ExitFeeModalView.propTypes = {
  loading: PropTypes.bool,
  showing: PropTypes.bool.isRequired,
  cancelCallback: PropTypes.func.isRequired,
  unstakeCallback: PropTypes.func.isRequired,
}

ExitFeeModalView.defaultProps = {
  loading: false,
}
