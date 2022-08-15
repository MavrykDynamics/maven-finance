import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, skyColor, cyanColor, headerColor, royalPurpleColor } from 'styles'

export const FarmCardTokenLogoContainer = styled.div<{ theme: MavrykTheme }>`
  height: 50px;
  align-items: center;
  position: relative;
  width: 50px;
  > img {
    align-items: center;
    justify-content: center;
    position: absolute;
  }
`
export const FarmCardFirstTokenIcon = styled.img<{ theme: MavrykTheme }>`
  height: 45px;
  width: 45px;
  bottom: 2px;
  right: -10px;
  align-self: flex-end;
  z-index: 1;
`
export const FarmCardSecondTokenIcon = styled.img<{ theme: MavrykTheme }>`
  height: 32px;
  width: 32px;
  top: -8px;
  left: 0;
  align-self: flex-end;
`

export default function CoinsIcons() {
  return (
    <FarmCardTokenLogoContainer>
      <FarmCardFirstTokenIcon src={'/images/coin-gold.svg'} />
      <FarmCardSecondTokenIcon src={'/images/coin-silver.svg'} />
    </FarmCardTokenLogoContainer>
  )
}
