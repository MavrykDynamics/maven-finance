import { useState } from 'react'
import { ModalCard, ModalCardContent } from '../../../../styles'
import { Button } from '../../Button/Button.controller'
import { Input, InputStatusType } from '../../Input/Input.controller'
import {
  FarmCardContentSection,
  FarmCardFirstTokenIcon,
  FarmCardSecondTokenIcon,
  FarmCardTokenLogoContainer,
  FarmCardTopSection,
  FarmTitleSection,
  FarmInputSection,
} from '../../../../pages/Farms/FarmCard/FarmCard.style'

export const FarmDepositModal = ({ loading, cancelCallback }: { loading: boolean; cancelCallback: any }) => {
  const [amount, setAmount] = useState(0)
  const [status, setStatus] = useState<InputStatusType>('')

  const handleBlur = () => {}

  const handleFocus = () => {}

  const handleChange = () => {}

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
              <h3>Stake MVK-tzBTC LP Tokens</h3>
            </FarmTitleSection>
          </FarmCardContentSection>
        </FarmCardTopSection>

        <FarmInputSection>
          <div className="input-info">
            <p>Min 1 MVK-tzBTC LP token</p>
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
            <p>MVK-tzBTC LP Balance</p>
            <p>5.12432</p>
          </div>
          <Button
            className="farm-button"
            text="Stake LP"
            kind="actionPrimary"
            icon="in"
            loading={loading}
            onClick={cancelCallback}
          />
        </FarmInputSection>
      </ModalCardContent>
    </ModalCard>
  )
}
