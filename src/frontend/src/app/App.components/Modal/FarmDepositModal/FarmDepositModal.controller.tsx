import { MODAL_DATA } from '../Modal.data'
import { ModalCard, ModalCardContent } from '../../../../styles'
import { Button } from '../../Button/Button.controller'
import * as React from 'react'
import {
  FarmCardContentSection,
  FarmCardFirstTokenIcon,
  FarmCardSecondTokenIcon,
  FarmCardTokenLogoContainer,
  FarmCardTopSection,
  FarmTitleSection,
} from '../../../../pages/Farms/FarmCard/FarmCard.style'

export const FarmDepositModal = ({ loading, cancelCallback }: { loading: boolean; cancelCallback: any }) => {
  const { title, subTitle, content } = MODAL_DATA.get('emergency-governance')
  return (
    <ModalCard>
      <ModalCardContent width={50}>
        <FarmCardTopSection>
          <FarmCardContentSection>
            <FarmCardTokenLogoContainer>
              <FarmCardFirstTokenIcon src={'/images/coin-gold.svg'} />
              <FarmCardSecondTokenIcon src={'/images/coin-silver.svg'} />
            </FarmCardTokenLogoContainer>
            <FarmTitleSection>
              <h3>Stake Blah Blah LP Tokens</h3>
            </FarmTitleSection>
          </FarmCardContentSection>
        </FarmCardTopSection>
        <h3>Farm Deposit Modal</h3>
        <p>{subTitle}</p>
        <p>{content}</p>
        <Button text="Acknowledge" kind="primary" icon="check" loading={loading} onClick={cancelCallback} />
      </ModalCardContent>
    </ModalCard>
  )
}
