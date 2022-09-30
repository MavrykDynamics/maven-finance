import { useState, useMemo, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

//view
import ModalPopup from '../../../app/App.components/Modal/ModalPopup.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { SlidingTabButtons, TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import Checkbox from '../../../app/App.components/Checkbox/Checkbox.view'
import Expand from '../../../app/App.components/Expand/Expand.view'

// style
import { RoiCalculatorStyled, RoiExpandStyled } from './RoiCalculator.style'
import { SUCCESS_STATUS, ERROR_STATUS } from 'app/App.components/Modal/FarmWithdrawModal/FarmWithdrawModal.controller'
import { calculateAPR, calculateAPY, getUserBalanceByAddress } from '../Farms.helpers'
import { SELECT_FARM_ADDRESS } from '../Farms.actions'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { votingRoundVoteType } from 'utils/TypesAndInterfaces/Governance'

const STAKED_ITEMS = [
  { text: '1D', id: 1, active: true, actualValue: 1 },
  { text: '7D', id: 2, active: false, actualValue: 7 },
  { text: '30D', id: 3, active: false, actualValue: 30 },
  { text: '1Y', id: 4, active: false, actualValue: 365 },
  { text: '5Y', id: 5, active: false, actualValue: 1825 },
]

const COMPOUNDING_ITEMS = [
  { text: '1D', id: 1, active: false, actualValue: 1 },
  { text: '7D', id: 2, active: false, actualValue: 7 },
  { text: '14D', id: 3, active: false, actualValue: 14 },
  { text: '30D', id: 4, active: false, actualValue: 30 },
]

type SelectedTabsStateType = {
  balanceTab: null | (TabItem & { actualValue: number | null })
  stakedTab: null | (TabItem & { actualValue: number | null })
  compoundTab: null | (TabItem & { actualValue: number | null })
}

type InputValuesType = {
  amount: number | ''
  backwardAmount: number | ''
}

type InputStatusesType = {
  amountStatus: InputStatusType
  backwardStatus: InputStatusType
}

type Props = {
  onClose: () => void
}

const LP_EXCHANGE_RATE = 0.5

export default function RoiCalculator({ onClose }: Props) {
  const dispatch = useDispatch()
  const { selectedFarmAddress, farmStorage } = useSelector((state: State) => state.farm)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)

  const farm = farmStorage.find(({ address }) => selectedFarmAddress === address)

  const [inputStatus, setInputStatus] = useState<InputStatusesType>({
    amountStatus: '',
    backwardStatus: '',
  })
  const [inputValue, setInputValue] = useState<InputValuesType>({
    amount: 0,
    backwardAmount: 0,
  })

  const [isPensilClicked, togglePensil] = useState(false)
  const [userBalance, setUserBalance] = useState(0)

  const STAKED_VALUES = useMemo(
    () => [
      { text: '$100', id: 1, active: false, actualValue: 100 },
      { text: '$1000', id: 2, active: false, actualValue: 1000 },
      { text: 'My Balance', id: 3, active: false, actualValue: userBalance, isDisabled: !accountPkh },
    ],
    [userBalance, accountPkh],
  )

  // state for tabs
  const [compoundEverythingActive, toggleCompoundEverything] = useState(false)
  const [shouldDisableBalanceTabs, toggleDisablingBalanceTabs] = useState(false)
  const [tabsSelected, selectTab] = useState<SelectedTabsStateType>({
    balanceTab: null,
    stakedTab: STAKED_VALUES[0],
    compoundTab: compoundEverythingActive ? COMPOUNDING_ITEMS[0] : null,
  })

  const lpValue = useMemo(() => Number(inputValue.amount) * LP_EXCHANGE_RATE, [inputValue.amount])

  const getUserBalance = async () => {
    const userBalanceFetched = Number(await getUserBalanceByAddress(farm?.lpTokenAddress))
    setUserBalance(userBalanceFetched)
  }

  useEffect(() => {
    getUserBalance()
  }, [])

  // validation for input and running calcuations based on input
  useEffect(() => {
    const validityStatus = +inputValue.backwardAmount >= 0 ? SUCCESS_STATUS : ERROR_STATUS

    setInputStatus({
      ...inputStatus,
      backwardStatus: validityStatus,
    })

    if (validityStatus === SUCCESS_STATUS) {
      //TODO: run calculations from end to start
    }
  }, [inputValue.backwardAmount])

  useEffect(() => {
    const validityStatus = +inputValue.amount >= 0 ? SUCCESS_STATUS : ERROR_STATUS

    setInputStatus({
      ...inputStatus,
      amountStatus: validityStatus,
    })

    if (validityStatus === SUCCESS_STATUS) {
      //TODO: run calculations from start to end
    }
  }, [inputValue.amount])

  // if farm address doesn't exists, close modal
  if (!farm) {
    dispatch({
      type: SELECT_FARM_ADDRESS,
      selectedFarmAddress: '',
    })

    return null
  }

  const tokensNames =
    farm.lpToken1.symbol && farm.lpToken2.symbol && `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}`
  const valueAPY = calculateAPY(farm.lpTokenRate)
  const farmAPR = calculateAPR(farm.currentRewardPerBlock, farm.lpTokenRate, farm.lpBalance)
  // handlers for inputs
  const handleBlur = () => {
    if (inputValue.amount === '') {
      setInputValue({
        ...inputValue,
        amount: 0,
      })
      return
    }

    if (inputValue.backwardAmount === '') {
      setInputValue({
        ...inputValue,
        backwardAmount: 0,
      })
      return
    }
  }

  const handleFocus = () => {
    if (inputValue.amount === 0) {
      setInputValue({
        ...inputValue,
        amount: '',
      })
      return
    }

    if (inputValue.backwardAmount === 0) {
      setInputValue({
        ...inputValue,
        backwardAmount: '',
      })
      return
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setInputValue({
      ...inputValue,
      [name]: value,
    })

    if (name === 'amount') {
      toggleDisablingBalanceTabs(true)
      selectTab({
        ...tabsSelected,
        balanceTab: null,
      })
    }
  }

  // handlers for selecting tabs
  const handleChangeStaked = (tabId?: number) => {
    const tabValue = STAKED_ITEMS.find(({ id }) => id === tabId) || null
    selectTab({
      ...tabsSelected,
      stakedTab: tabValue,
    })
  }

  const handleChangeCompounding = (tabId: number) => {
    if (!compoundEverythingActive) return
    const tabValue = COMPOUNDING_ITEMS.find(({ id }) => id === tabId) || null
    const isSecondClickOnTheTab = tabValue?.id === tabsSelected.compoundTab?.id
    selectTab({
      ...tabsSelected,
      compoundTab: isSecondClickOnTheTab ? null : tabValue,
    })
  }

  const handleChangeValues = (tabId?: number) => {
    toggleDisablingBalanceTabs(false)
    const tabValue = STAKED_VALUES.find(({ id }) => id === tabId) || null
    selectTab({
      ...tabsSelected,
      balanceTab: tabValue,
    })

    setInputValue({
      ...inputValue,
      amount: tabValue?.actualValue ?? userBalance,
    })
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
            {tokensNames} LP Staked
          </label>
          <Input
            id="input-roi"
            type={'number'}
            name={'amount'}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={inputValue.amount}
            pinnedText={'USD'}
            inputStatus={inputStatus.amountStatus}
            className="farm-modal-input"
          />
          <label className="exchange-roi" htmlFor="input-roi">
            <span>
              <CommaNumber value={lpValue} />
            </span>
            <span>{tokensNames}</span>
          </label>
        </fieldset>

        <div className="tab-block">
          <SlidingTabButtons
            className="tab-component values-tabs"
            tabItems={STAKED_VALUES}
            onClick={handleChangeValues}
            disableAll={shouldDisableBalanceTabs}
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
            <Checkbox
              className="compounding-checkbox"
              id="compounding-checkbox"
              checked={compoundEverythingActive}
              onChangeHandler={() => toggleCompoundEverything(!compoundEverythingActive)}
            />
            <SlidingTabButtons
              className="tab-component compounding-tabs"
              tabItems={COMPOUNDING_ITEMS}
              onClick={handleChangeCompounding}
              disabled={!compoundEverythingActive}
            />
          </div>
        </div>

        <div className="current-rates">
          <div>
            <h3>ROI at Current Rates</h3>

            {isPensilClicked ? (
              <div className="input-wrapper">
                <Input
                  id="input-roi-backward"
                  type={'number'}
                  name={'backwardAmount'}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  value={inputValue.backwardAmount}
                  pinnedText={'USD'}
                  inputStatus={inputStatus.backwardStatus}
                  className="farm-modal-backward-input"
                />
                <label className="exchange-roi-backward" htmlFor="input-roi-backward">
                  <span>
                    <CommaNumber
                      beginningText="~"
                      value={+inputValue.backwardAmount * exchangeRate}
                      endingText="sMVK"
                    />
                    <CommaNumber
                      beginningText="("
                      value={(+inputValue.backwardAmount * 100) / +inputValue.amount}
                      endingText="%)"
                    />
                  </span>
                </label>
              </div>
            ) : (
              <>
                <var>
                  <CommaNumber beginningText="$" value={+inputValue.backwardAmount} />
                </var>
                <p>
                  <CommaNumber beginningText="~" value={+inputValue.backwardAmount * exchangeRate} endingText="sMVK" />
                  <CommaNumber
                    beginningText="("
                    value={(+inputValue.backwardAmount * 100) / +inputValue.amount}
                    endingText="%)"
                  />
                </p>
              </>
            )}
          </div>
          <button
            className={`${isPensilClicked ? 'active' : ''}`}
            type="button"
            onClick={() => togglePensil(!isPensilClicked)}
          >
            <Icon id="pencil-stroke" />
          </button>
        </div>
      </RoiCalculatorStyled>
      <RoiExpandStyled>
        <Expand className="roi-expand" showCustomText="Details">
          <ul className="roi-expand-ul">
            <li>
              <h4>APR (incl LP rewards)</h4>
              <var>
                <CommaNumber value={farmAPR} endingText="%" />
              </var>
            </li>
            <li>
              <h4>Base APR (MVK yield only)</h4>
              <var>
                <CommaNumber value={0} endingText="%" />
              </var>
            </li>
            <li>
              <h4>LP Rewards APR</h4>
              <var>
                <CommaNumber value={farmAPR} endingText="%" />
              </var>
            </li>
            <li>
              <h4>APY</h4>
              <var>
                <CommaNumber value={valueAPY} endingText="%" />
              </var>
            </li>
            <li>
              <h4>Farm Multiplier</h4>
              <var>
                <CommaNumber value={0} endingText="%" />
              </var>
            </li>
          </ul>
        </Expand>
      </RoiExpandStyled>
    </ModalPopup>
  )
}
