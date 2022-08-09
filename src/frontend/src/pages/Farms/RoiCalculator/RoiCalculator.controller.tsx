import { useState } from 'react'

//view
import ModalPopup from '../../../app/App.components/Modal/ModalPopup.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'
import { Input, InputStatusType } from '../../../app/App.components/Input/Input.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// helpers
import { mathRoundTwoDigit } from '../../../utils/validatorFunctions'

// style
import { RoiCalculatorStyled } from './RoiCalculator.style'

type Props = {
  onClose: () => void
}

const STAKED_VALUES = [
  { text: '$100', id: 1, active: true },
  { text: '$1000', id: 2, active: false },
  { text: 'My Balance', id: 3, active: false },
]

const STAKED_ITEMS = [
  { text: '1D', id: 1, active: true },
  { text: '7D', id: 2, active: false },
  { text: '30D', id: 3, active: false },
  { text: '1Y', id: 4, active: false },
  { text: '5Y', id: 5, active: false },
]

const COMPOUNDING_ITEMS = [
  { text: '1D', id: 1, active: true },
  { text: '7D', id: 2, active: false },
  { text: '14D', id: 3, active: false },
  { text: '30D', id: 4, active: false },
]

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

  const handleChangeStaked = (tabId?: number) => {
    console.log('%c ||||| handleChangeStaked tabId', 'color:yellowgreen', tabId)
  }

  const handleChangeCompounding = (tabId?: number) => {
    console.log('%c ||||| handleChangeCompounding tabId', 'color:yellowgreen', tabId)
  }

  const handleChangeValues = (tabId?: number) => {
    console.log('%c ||||| handleChangeValues tabId', 'color:yellowgreen', tabId)
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

        <div className="tab-block">
          <SlidingTabButtons
            className="tab-component values-tabs"
            tabItems={STAKED_VALUES}
            onClick={handleChangeValues}
          />
        </div>

        <div className="tab-block">
          <h4>Staked For</h4>
          <SlidingTabButtons
            className="tab-component staked-tabs"
            tabItems={STAKED_ITEMS}
            onClick={handleChangeStaked}
          />
        </div>

        <div className="tab-block">
          <h4>Compounding Every</h4>
          <div>
            <SlidingTabButtons
              className="tab-component compounding-tabs"
              tabItems={COMPOUNDING_ITEMS}
              onClick={handleChangeCompounding}
            />
          </div>
        </div>

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
