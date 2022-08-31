import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

//view
import ModalPopup from '../../../app/App.components/Modal/ModalPopup.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import Checkbox from '../../../app/App.components/Checkbox/Checkbox.view'
import Expand from '../../../app/App.components/Expand/Expand.view'

// helpers
import { mathRoundTwoDigit } from '../../../utils/validatorFunctions'

// style
import { RoiCalculatorStyled, RoiExpandStyled } from './RoiCalculator.style'

type Props = {
  onClose: () => void
  lpTokenAddress: string
}

export default function RoiCalculator({ onClose, lpTokenAddress }: Props) {
  const { selectedFarmAddress, farmContracts } = useSelector((state: State) => state.farm)
  const [amount, setAmount] = useState<number | ''>('')
  const [status, setStatus] = useState<InputStatusType>('')
  console.log('%c ||||| farmContracts', 'color:yellowgreen', farmContracts)
  console.log('%c ||||| selectedFarmAddress', 'color:yellowgreen', selectedFarmAddress)
  const currentContract = useMemo(
    () => farmContracts.find((item) => item.address === lpTokenAddress),
    [selectedFarmAddress, farmContracts],
  )

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
  const STAKED_VALUES = [
    { text: '$100', id: 1, active: false },
    { text: '$1000', id: 2, active: false },
    { text: 'My Balance', id: 3, active: false },
  ]

  console.log('%c ||||| currentContract', 'color:yellowgreen', currentContract)

  console.log('%c ||||| STAKED_VALUES', 'color:gold', STAKED_VALUES)

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

  const handleChange = (text: string) => {
    const value = mathRoundTwoDigit(text)
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
    const balance = currentContract?.balance ?? 0
    const value = tabId === 1 ? 100 : tabId === 2 ? 1000 : balance
    handleChange(`${value}`)
  }

  return (
    <ModalPopup className="modal-roi" onClose={onClose}>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
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
            tabItems={Array.from(STAKED_VALUES)}
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
          <div className="compounding-every">
            <Checkbox className="compounding-checkbox" id="compounding-checkbox" />
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
      <RoiExpandStyled>
        <Expand className="roi-expand" showCustomText="Details" header={<></>}>
          <ul className="roi-expand-ul">
            <li>
              <h4>APR (incl LP rewards)</h4>
              <var>21.57%</var>
            </li>
            <li>
              <h4>Base APR (MVK yield only)</h4>
              <var>21.57%</var>
            </li>
            <li>
              <h4>LP Rewards APR</h4>
              <var>21.57%</var>
            </li>
            <li>
              <h4>APY</h4>
              <var>21.57%</var>
            </li>
            <li>
              <h4>Farm Multiplier</h4>
              <var>21.57%</var>
            </li>
          </ul>
        </Expand>
      </RoiExpandStyled>
    </ModalPopup>
  )
}
