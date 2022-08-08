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
  height: 40px;
  width: 40px;
  bottom: 0;
  right: 0;
  align-self: flex-end;
  z-index: 1;
`
export const FarmCardSecondTokenIcon = styled.img<{ theme: MavrykTheme }>`
  height: 35px;
  width: 35px;
  top: 0;
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
