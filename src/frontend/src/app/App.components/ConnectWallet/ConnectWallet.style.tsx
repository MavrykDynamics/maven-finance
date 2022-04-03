import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { BUTTON_RADIUS } from '../../../styles/constants'

export const ConnectWalletStyled = styled.div<{ theme: MavrykTheme }>`
  text-align: center;
  border-radius: ${BUTTON_RADIUS};
  margin: 10px auto 15px;
  overflow: hidden;
  width: 80%;
  max-width: 216px;
`

export const WalletConnectedButton = styled.div<{ theme: MavrykTheme }>`
  font-weight: 600;
  margin: 10px auto;

  > p {
    font-size: 11px;
    line-height: 11px;
    margin: 3px;
    color: ${({ theme }) => theme.textColor};
  }

  > div {
    font-size: 18px;
    line-height: 18px;
    color: ${({ theme }) => theme.primaryColor};
  }

  svg {
    cursor: pointer;
    height: 12px;
    margin-left: 10px;
    width: 20px;
    vertical-align: bottom;
    stroke: ${({ theme }) => theme.primaryColor};
  }
`
export const WalletNotConnectedButton = styled.div<{ theme: MavrykTheme }>`
  margin: 0 auto;
  height: 50px;
  cursor: pointer;
  background: ${({ theme }) => theme.connectWalletBackgroundColor};
  color: ${({ theme }) => theme.subTextColor};
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  font-size: 12px;

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${({ theme }) => theme.subTextColor};
    vertical-align: top;
  }

  > div {
    display: inline-block;
    margin-right: 9px;
    font-weight: 600;
  }
`

export const SimpleConnectedButton = styled.div<{ theme: MavrykTheme }>`
  margin: 0 auto;
  height: 50px;
  cursor: pointer;
  background: ${({ theme }) => theme.containerColor};
  color: ${({ theme }) => theme.textColor};
  border-color: ${({ theme }) => theme.textColor};
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  font-size: 12px;

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${({ theme }) => theme.textColor};
    vertical-align: top;
  }

  > div {
    display: inline-block;
    margin-right: 9px;
    font-weight: 600;
  }
`
