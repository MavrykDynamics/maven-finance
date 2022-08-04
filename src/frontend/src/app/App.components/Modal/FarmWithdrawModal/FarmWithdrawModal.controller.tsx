import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { Button } from '../../Button/Button.controller'
import { Input, InputStatusType } from '../../Input/Input.controller'

// helpers
import { isValidNumberValue, mathRoundTwoDigit, validateFormAndThrowErrors } from '../../../../utils/validatorFunctions'

// actions
import { withdraw } from '../../../../pages/Farms/Farms.actions'

// styles
import { ModalCard, ModalCardContent } from '../../../../styles'
import {
  FarmCardContentSection,
  FarmCardFirstTokenIcon,
  FarmCardSecondTokenIcon,
  FarmCardTokenLogoContainer,
  FarmCardTopSection,
  FarmTitleSection,
  FarmInputSection,
} from '../../../../pages/Farms/FarmCard/FarmCard.style'

export const FarmWithdrawModal = ({ loading, cancelCallback }: { loading: boolean; cancelCallback: any }) => {
  const dispatch = useDispatch()
  const { selectedFarmAddress } = useSelector((state: State) => state.farm)
  const [amount, setAmount] = useState<number | ''>('')
  const [status, setStatus] = useState<InputStatusType>('')

  const disabled = !amount || !selectedFarmAddress

  const checkInputIsOk = (value: number | '') => {
    setStatus(value ? 'success' : 'error')
  }

  const handleBlur = (e: any) => {
    const value = mathRoundTwoDigit(e.target.value)
    checkInputIsOk(value)
  }

  const handleFocus = (e: any) => {
    const value = e.target.value

    if (+value === 0) {
      setAmount('')
    }
  }

  const handleChange = (e: any) => {
    const value = mathRoundTwoDigit(e.target.value)
    setAmount(+value)
    checkInputIsOk(value)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()

    if (!disabled) {
      dispatch(withdraw(selectedFarmAddress, amount))
    }
  }

  return (
    <ModalCard>
      <ModalCardContent className="farm-modal">
        <FarmCardTopSection>
          <FarmCardContentSection>
            <FarmCardTokenLogoContainer>
              <FarmCardFirstTokenIcon src={'/images/coin-gold.svg'} />
              <FarmCardSecondTokenIcon src={'/images/coin-silver.svg'} />
            </FarmCardTokenLogoContainer>
            <FarmTitleSection>
              <h3>Unstake MVK-tzBTC LP Tokens</h3>
            </FarmTitleSection>
          </FarmCardContentSection>
        </FarmCardTopSection>

        <FarmInputSection onSubmit={handleSubmit}>
          <div className="input-info">
            <p>Min 1 LP token</p>
            <button>Use Max</button>
          </div>
          <Input
            type={'number'}
            placeholder={String(amount)}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={amount}
            pinnedText={'MVK-tzBTC LP'}
            inputStatus={status}
            errorMessage={''}
          />
          <div className="input-info">
            <p>tzBTC LP Balance</p>
            <p>5.12432</p>
          </div>
          <div className="input-info">
            <p>Withdrawal Fee</p>
            <p>1.4%</p>
          </div>
          <Button
            className="farm-button"
            text="Withdrawal"
            kind="actionSecondary"
            icon="out"
            loading={loading}
            type="submit"
            disabled={disabled}
          />
        </FarmInputSection>
      </ModalCardContent>
    </ModalCard>
  )
}
