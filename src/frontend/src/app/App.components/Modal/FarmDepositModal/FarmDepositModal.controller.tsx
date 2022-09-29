import React, { useEffect, useState } from 'react'
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
import { deposit, SELECT_FARM_ADDRESS } from '../../../../pages/Farms/Farms.actions'

// styles
import { ModalCard, ModalCardContent } from '../../../../styles'
import {
  FarmCardContentSection,
  FarmCardTopSection,
  FarmTitleSection,
  FarmInputSection,
} from '../../../../pages/Farms/FarmCard/FarmCard.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { getUserBalanceByAddress } from 'pages/Farms/Farms.helpers'
import { ERROR_STATUS, SUCCESS_STATUS } from '../FarmWithdrawModal/FarmWithdrawModal.controller'

export const FarmDepositModal = () => {
  const dispatch = useDispatch()
  const { selectedFarmAddress, farmStorage } = useSelector((state: State) => state.farm)
  const farm = farmStorage.find(({ address }) => selectedFarmAddress === address)

  const [userBalance, setUserBalance] = useState(0)
  const [amount, setAmount] = useState<number | string>(0)
  const [status, setStatus] = useState<InputStatusType>('')

  const checkInputIsOk = (value: number | '') => {
    setStatus(value && value <= userBalance && value >= 0 ? SUCCESS_STATUS : ERROR_STATUS)
  }

  const getUserBalance = async () => {
    const userBalanceFetched = Number(await getUserBalanceByAddress(farm?.lpTokenAddress))
    setUserBalance(userBalanceFetched)
  }

  useEffect(() => {
    getUserBalance()
  }, [])

  useEffect(() => {
    checkInputIsOk(Number(amount))
  }, [amount])

  // if farm address doesn't exists, close modal
  if (!farm) {
    dispatch({
      type: SELECT_FARM_ADDRESS,
      selectedFarmAddress: '',
    })

    return null
  }

  const disabled = !amount || !selectedFarmAddress || status === ERROR_STATUS

  const tokesnNames =
    farm.lpToken1.symbol && farm.lpToken2.symbol && `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}`

  const handleBlur = () => {
    if (amount === '') {
      setAmount(0)
    }
  }

  const handleFocus = () => {
    if (amount === 0) {
      setAmount('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.setCustomValidity('')
    setAmount(e.target.value)

    if (Number(e.target.value) > userBalance) {
      e.target.setCustomValidity('Not enough balance')
      e.target.reportValidity()
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!disabled) {
      dispatch(deposit(selectedFarmAddress, Number(amount)))
    }
  }

  const useMaxHandler = () => {
    setAmount(+userBalance)
  }

  return (
    <ModalCard>
      <ModalCardContent className="farm-modal">
        <FarmCardTopSection>
          <FarmCardContentSection>
            <CoinsIcons />
            <FarmTitleSection>
              <h3>Stake {tokesnNames} LP Tokens</h3>
            </FarmTitleSection>
          </FarmCardContentSection>
        </FarmCardTopSection>

        <FarmInputSection onSubmit={handleSubmit}>
          <div className="input-info">
            <div />
            <button type="button" onClick={useMaxHandler}>
              Use Max
            </button>
          </div>
          <Input
            type={'number'}
            placeholder={String(amount)}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={amount}
            pinnedText={tokesnNames + ' LP'}
            inputStatus={status}
            className="farm-modal-input"
          />
          <div className="input-info">
            <p>{tokesnNames} LP Balance</p>
            <p>
              <CommaNumber value={userBalance} />
            </p>
          </div>
          <Button
            className="farm-button"
            text="Stake LP"
            kind="actionPrimary"
            icon="in"
            type="submit"
            disabled={disabled}
          />
        </FarmInputSection>
      </ModalCardContent>
    </ModalCard>
  )
}
