import { useState } from 'react'

//view
import ModalPopup from '../../../app/App.components/Modal/ModalPopup.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'
import { Input, InputStatusType } from '../../../app/App.components/Input/Input.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { mathRoundTwoDigit } from '../../../utils/validatorFunctions'

// style
import { RoiCalculatorStyled } from './RoiCalculator.style'

type Props = {
  onClose: () => void
}

export default function RoiCalculator({ onClose }: Props) {
  const [amount, setAmount] = useState<number | ''>('')
  const [status, setStatus] = useState<InputStatusType>('')
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

  return (
    <ModalPopup onClose={onClose}>
      <RoiCalculatorStyled>
        <header>
          <CoinsIcons />
          <h2>ROI Calculator</h2>
        </header>

        <fieldset className="fieldset-roi">
          <label className="label-roi" htmlFor="input-roi">
            MVK-tzBTC LP Staked
          </label>
          <Input
            id="input-roi"
            type={'number'}
            placeholder={String(amount)}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={amount}
            pinnedText={'USD'}
            inputStatus={status}
            errorMessage={''}
          />
          <label className="exchange-roi" htmlFor="input-roi">
            <span>87.23451</span>
            <span>MVK-tzBTC</span>
          </label>
        </fieldset>
        <div className="current-rates">
          <div>
            <h3>ROI at Current Rates</h3>
            <var>$0.00</var>
            <p>~0.00 sMVK (0.00%)</p>
          </div>
          <button>
            <Icon id="pencil-stroke" />
          </button>
        </div>
      </RoiCalculatorStyled>
    </ModalPopup>
  )
}
