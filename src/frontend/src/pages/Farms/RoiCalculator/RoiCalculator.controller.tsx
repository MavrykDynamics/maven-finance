import { useState, useMemo, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

//view
import ModalPopup from '../../../app/App.components/Modal/ModalPopup.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import Checkbox from '../../../app/App.components/Checkbox/Checkbox.view'
import Expand from '../../../app/App.components/Expand/Expand.view'
import { SUCCESS_STATUS, ERROR_STATUS } from 'app/App.components/Modal/FarmWithdrawModal/FarmWithdrawModal.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// style
import { RoiCalculatorStyled, RoiExpandStyled } from './RoiCalculator.style'

// types
import { InputStatusesType, InputValuesType, RoiCalcProps, SelectedTabsStateType } from './RoiCalc.types'

// consts, helpers
import { calculateAPR, calculateAPY, getUserBalanceByAddress } from '../Farms.helpers'
import {
  BOTTOM_INPUT,
  COMPOUNDING_ITEMS,
  defaultInputStatuses,
  defaultInputValues,
  getOppositeROIvalue,
  LP_EXCHANGE_RATE,
  oppositeInputNameMapper,
  STAKED_ITEMS,
  TOP_INPUT,
} from './RoiCalc.helpers'
import { SELECT_FARM_ADDRESS } from '../Farms.actions'

export default function RoiCalculator({ onClose }: RoiCalcProps) {
  const dispatch = useDispatch()
  const { selectedFarmAddress, farmStorage } = useSelector((state: State) => state.farm)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)

  const farm = farmStorage.find(({ address }) => selectedFarmAddress === address)

  const [inputStatus, setInputStatus] = useState<InputStatusesType>(defaultInputStatuses)
  const [inputValues, setInputValue] = useState<InputValuesType>(defaultInputValues)
  const [lastInputUse, setLastInputUse] = useState<typeof TOP_INPUT | typeof BOTTOM_INPUT>(TOP_INPUT)
  const [isPensilClicked, togglePensil] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [compoundEverythingActive, toggleCompoundEverything] = useState(false)
  const [shouldDisableBalanceTabs, toggleDisablingBalanceTabs] = useState(true)
  const [tabsSelected, selectTab] = useState<SelectedTabsStateType>({
    balanceTab: null,
    stakedTab: STAKED_ITEMS[0],
    compoundTab: compoundEverythingActive ? COMPOUNDING_ITEMS[0] : null,
  })

  const TOGGLE_BALANCE_TABS = useMemo(
    () => [
      { text: '$100', id: 1, active: +inputValues.amount === 100, actualValue: 100 },
      { text: '$1000', id: 2, active: +inputValues.amount === 1000, actualValue: 1000 },
      { text: 'My Balance', id: 3, active: false, actualValue: userBalance, isDisabled: !accountPkh },
    ],
    [userBalance, accountPkh, inputValues.amount],
  )

  const lpValue = useMemo(() => Number(inputValues.amount) * LP_EXCHANGE_RATE, [inputValues.amount])

  useEffect(() => {
    ;(async () => {
      const userBalanceFetched = Number(await getUserBalanceByAddress(farm?.lpTokenAddress))
      setUserBalance(userBalanceFetched)
    })().catch((e) => console.error('fetching user balance in ROI calc error: ', e))
  }, [farm?.lpTokenAddress])

  // validation for input and running calcuations based on input
  useEffect(() => {
    const validityStatus = +inputValues.backwardAmount >= 0 ? SUCCESS_STATUS : ERROR_STATUS

    setInputStatus({
      ...inputStatus,
      backwardStatus: validityStatus,
    })
  }, [inputValues.backwardAmount])

  useEffect(() => {
    const validityStatus = +inputValues.amount >= 0 ? SUCCESS_STATUS : ERROR_STATUS

    setInputStatus({
      ...inputStatus,
      amountStatus: validityStatus,
    })
  }, [inputValues.amount])

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
  const valueAPY = calculateAPY(farm.currentRewardPerBlock, farm.lpBalance)
  const farmAPR = calculateAPR(farm.currentRewardPerBlock, farm.totalBlocks, farm.lpBalance)

  // handlers for inputs
  const handleBlur = () => {
    if (inputValues.amount === '') {
      setInputValue({
        ...inputValues,
        amount: 0,
      })
      return
    }

    if (inputValues.backwardAmount === '') {
      setInputValue({
        ...inputValues,
        backwardAmount: 0,
      })
      return
    }
  }

  const handleFocus = () => {
    if (inputValues.amount === 0) {
      setInputValue({
        ...inputValues,
        amount: '',
      })
      return
    }

    if (inputValues.backwardAmount === 0) {
      setInputValue({
        ...inputValues,
        backwardAmount: '',
      })
      return
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: 'amount' | 'backwardAmount'; value: number | string }
    const oppositeInputValue = getOppositeROIvalue(
      name,
      value,
      compoundEverythingActive,
      farm,
      tabsSelected.stakedTab?.actualValue,
      tabsSelected.compoundTab?.actualValue,
    )
    setInputValue({
      ...inputValues,
      [name]: value,
      [oppositeInputNameMapper[name]]: oppositeInputValue,
    })
    setLastInputUse(name)

    const toggleBtn = TOGGLE_BALANCE_TABS.find(({ actualValue }) => +value === actualValue)

    if (name === 'amount') {
      console.log('toggleBtn', toggleBtn)

      toggleDisablingBalanceTabs(!toggleBtn)
      selectTab({
        ...tabsSelected,
        balanceTab: toggleBtn ?? null,
      })
    }
  }

  // handlers for selecting tabs
  const handleChangeStaked = (tabId: number) => {
    const tabValue = STAKED_ITEMS.find(({ id }) => id === tabId) || null
    selectTab({
      ...tabsSelected,
      stakedTab: tabValue,
    })

    const oppositeInputValue = getOppositeROIvalue(
      lastInputUse,
      inputValues[lastInputUse],
      compoundEverythingActive,
      farm,
      tabValue?.actualValue,
      tabsSelected.compoundTab?.actualValue,
    )
    setInputValue({
      ...inputValues,
      [oppositeInputNameMapper[lastInputUse]]: oppositeInputValue,
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

    const oppositeInputValue = getOppositeROIvalue(
      lastInputUse,
      inputValues[lastInputUse],
      compoundEverythingActive,
      farm,
      tabsSelected.stakedTab?.actualValue,
      tabValue?.actualValue,
    )
    setInputValue({
      ...inputValues,
      [oppositeInputNameMapper[lastInputUse]]: oppositeInputValue,
    })
  }

  const handleChangeValues = (tabId: number) => {
    toggleDisablingBalanceTabs(false)
    const tabValue = TOGGLE_BALANCE_TABS.find(({ id }) => id === tabId) || null
    selectTab({
      ...tabsSelected,
      balanceTab: tabValue,
    })

    const oppositeInputValue = getOppositeROIvalue(
      TOP_INPUT,
      tabValue?.actualValue ?? userBalance,
      compoundEverythingActive,
      farm,
      tabsSelected.stakedTab?.actualValue,
      tabValue?.actualValue,
    )
    setInputValue({
      amount: tabValue?.actualValue ?? userBalance,
      backwardAmount: oppositeInputValue,
    })
  }

  return (
    <ModalPopup className="modal-roi scroll-block" onClose={onClose}>
      <RoiCalculatorStyled>
        <header>
          <CoinsIcons
            firstAssetLogoSrc={farm.lpToken1.thumbnailUri ?? farm.lpToken1.address}
            secondAssetLogoSrc={farm.lpToken2.thumbnailUri ?? farm.lpToken2.address}
          />
          <h2>ROI Calculator</h2>
        </header>

        <fieldset className="fieldset-roi">
          <label className="label-roi" htmlFor="input-roi">
            {tokensNames} LP Staked
          </label>
          <Input
            id="input-roi"
            type={'number'}
            name={TOP_INPUT}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={inputValues.amount}
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
            tabItems={TOGGLE_BALANCE_TABS}
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
              disableAll={!compoundEverythingActive}
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
                  name={BOTTOM_INPUT}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  value={inputValues.backwardAmount}
                  pinnedText={'USD'}
                  inputStatus={inputStatus.backwardStatus}
                  className="farm-modal-backward-input"
                />
                <label className="exchange-roi-backward" htmlFor="input-roi-backward">
                  <span>
                    <CommaNumber
                      beginningText="~"
                      value={+inputValues.backwardAmount * exchangeRate}
                      endingText="sMVK"
                    />
                    <CommaNumber
                      beginningText="("
                      value={(+inputValues.backwardAmount * 100) / +inputValues.amount}
                      endingText="%)"
                    />
                  </span>
                </label>
              </div>
            ) : (
              <>
                <var>
                  <CommaNumber beginningText="$" value={+inputValues.backwardAmount} />
                </var>
                <p>
                  <CommaNumber beginningText="~" value={+inputValues.backwardAmount * exchangeRate} endingText="sMVK" />
                  <CommaNumber
                    beginningText="("
                    value={(+inputValues.backwardAmount - +inputValues.amount) * 100}
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
              <h4>Base APR (MVK yield only)</h4>
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
          </ul>
        </Expand>
      </RoiExpandStyled>
    </ModalPopup>
  )
}
