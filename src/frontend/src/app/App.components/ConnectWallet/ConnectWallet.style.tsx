import styled from 'styled-components/macro'

import { skyColor } from '../../../styles'
import { BUTTON_RADIUS } from '../../../styles/constants'
import { MavrykTheme } from '../../../styles/interfaces'

export const ConnectWalletStyled = styled.div<{ theme: MavrykTheme }>`
  text-align: center;
  border-radius: ${BUTTON_RADIUS};
  margin: 10px auto 34px;
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
export const WalletNotConnectedButton = styled.button<{ theme: MavrykTheme }>`
  margin: 0 auto;
  height: 50px;
  cursor: pointer;
  color: ${skyColor};
  border: 2px solid ${skyColor};
  border-radius: ${BUTTON_RADIUS};
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 190px;
  background: none;

  svg {
    width: 24px;
    height: 19px;
    stroke: ${skyColor};
    fill: transparent;
    margin-right: 16px;
  }

  span {
    padding-right: 16px;
  }
`

export const SimpleConnectedButton = styled.div<{ theme: MavrykTheme }>`
  margin: 0 auto;
  height: 50px;
  cursor: pointer;
  color: ${({ theme }) => theme.connectWalletSecondary};
  border: 2px solid ${({ theme }) => theme.connectWalletSecondary};
  border-radius: ${BUTTON_RADIUS};
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  font-size: 12px;

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${({ theme }) => theme.connectWalletSecondary};
    vertical-align: top;
  }

  > div {
    display: inline-block;
    margin-right: 9px;
    font-weight: 600;
    color: ${({ theme }) => theme.connectWalletSecondary};
  }
`

export const ConnectWalletInfoStyled = styled.blockquote<{ theme: MavrykTheme }>`
  border-radius: 10px;
  margin: 0;
  display: flex;
  align-items: center;
  padding: 25px;
  background-color: ${({ theme }) => theme.connectInfoColor};
  margin-top: 32px;

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    margin-right: 32px;
    color: ${({ theme }) => theme.headerColor};
    margin-top: 2px;
    margin-bottom: 2px;

    & + div {
      margin: 0;
    }
  }
`

export const ConnectWalletClose = styled.button<{ theme: MavrykTheme }>`
  background: transparent;
  border: none;
  padding: 0;
  margin-left: 32px;
  cursor: pointer;

  .close-connect-wallet {
    stroke: ${({ theme }) => theme.headerColor};
    width: 14px;
    height: 14px;
  }
`
