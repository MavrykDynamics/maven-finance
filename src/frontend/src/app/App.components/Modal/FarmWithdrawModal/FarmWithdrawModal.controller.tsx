import { useEffect, useState } from 'react'
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
import { SELECT_FARM_ADDRESS, withdraw } from '../../../../pages/Farms/Farms.actions'

// styles
import { ModalCard, ModalCardContent } from '../../../../styles'
import {
  FarmCardContentSection,
  FarmCardTopSection,
  FarmTitleSection,
  FarmInputSection,
} from '../../../../pages/Farms/FarmCard/FarmCard.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

export const FarmWithdrawModal = () => {
  const dispatch = useDispatch()
  const { selectedFarmAddress, farmStorage } = useSelector((state: State) => state.farm)
  const farm = farmStorage.find(({ address }) => selectedFarmAddress === address)
  //TODO: add balance of user
  const userBalanceOfTokens = 112.53234123

  const [amount, setAmount] = useState<number | ''>(0)
  const [status, setStatus] = useState<InputStatusType>('')

  const checkInputIsOk = (value: number | '') => {
    setStatus(value ? 'success' : 'error')
  }

  useEffect(() => {
    checkInputIsOk(amount)
  }, [amount])

  // if farm address doesn't exists, close modal
  if (!farm) {
    dispatch({
      type: SELECT_FARM_ADDRESS,
      selectedFarmAddress: '',
    })

    return null
  }

  const disabled = !amount || !selectedFarmAddress

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
    const value = mathRoundTwoDigit(e.target.value)
    setAmount(+value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!disabled) {
      dispatch(withdraw(selectedFarmAddress, amount))
    }
  }

  const useMaxHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAmount(+userBalanceOfTokens)
  }

  return (
    <ModalCard>
      <ModalCardContent className="farm-modal">
        <FarmCardTopSection>
          <FarmCardContentSection>
            <CoinsIcons />
            <FarmTitleSection>
              <h3>Unstake {tokesnNames} LP Tokens</h3>
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
              <CommaNumber value={userBalanceOfTokens} />
            </p>
          </div>
          <div className="input-info">
            <p>Withdrawal Fee</p>
            <p>
              <CommaNumber value={1.4} endingText="%" />
            </p>
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
