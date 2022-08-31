import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { Button } from '../../Button/Button.controller'
import { Input } from '../../Input/Input.controller'
import { InputStatusType } from '../../Input/Input.constants'
import CoinsIcons from '../../Icon/CoinsIcons.view'

// helpers
import { mathRoundTwoDigit } from '../../../../utils/validatorFunctions'

// actions
import { withdraw } from '../../../../pages/Farms/Farms.actions'

// styles
import { ModalCard, ModalCardContent } from '../../../../styles'
import {
  FarmCardContentSection,
  FarmCardTopSection,
  FarmTitleSection,
  FarmInputSection,
} from '../../../../pages/Farms/FarmCard/FarmCard.style'

export const FarmWithdrawModal = () => {
  const dispatch = useDispatch()
  const { selectedFarmAddress } = useSelector((state: State) => state.farm)
  const [amount, setAmount] = useState<number | ''>('')
  const [status, setStatus] = useState<InputStatusType>('')

  const disabled = !amount || !selectedFarmAddress

  const checkInputIsOk = (value: number | '') => {
    setStatus(value ? 'success' : 'error')
  }

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = mathRoundTwoDigit(e.target.value)
    checkInputIsOk(value)
  }

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (+value === 0) {
      setAmount('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = mathRoundTwoDigit(e.target.value)
    setAmount(+value)
    checkInputIsOk(value)
  }

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
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
            <CoinsIcons />
            <FarmTitleSection>
              <h3>Unstake MVK-tzBTC LP Tokens</h3>
            </FarmTitleSection>
          </FarmCardContentSection>
        </FarmCardTopSection>

        <FarmInputSection onSubmit={handleSubmit}>
          <div className="input-info">
            <div />
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
            type="submit"
            disabled={disabled}
          />
        </FarmInputSection>
      </ModalCardContent>
    </ModalCard>
  )
}
