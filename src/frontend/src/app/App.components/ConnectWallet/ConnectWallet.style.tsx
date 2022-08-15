import styled from 'styled-components/macro'
import { skyColor } from 'styles'
import { BUTTON_RADIUS } from 'styles/constants'
import { MavrykTheme } from 'styles/interfaces'

export const ConnectWalletStyled = styled.div<{ theme: MavrykTheme }>`
  text-align: center;
  border-radius: ${BUTTON_RADIUS};
  margin: 10px auto 34px;
  width: 100%;
  display: flex;
  column-gap: 20px;
`

export const WalletConnectedButton = styled.div<{ theme: MavrykTheme }>`
  font-weight: 600;
  margin: 10px auto;
  display: flex;
  column-gap: 10px;
  align-items: center;
  margin-top: -6px;
  margin-bottom: -6px;

  var {
    font-weight: 400;
    font-size: 14px;
    line-height: 14px;
    font-style: normal;
    color: ${({ theme }) => theme.headerSkyColor};
    margin-bottom: 5px;

    > div {
      svg {
        stroke: ${({ theme }) => theme.headerSkyColor};
        width: 18px;
        height: 18px;
        margin-left: 6px;
      }
    }
  }

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 14px;
    color: ${({ theme }) => theme.stakedColor};
    margin-top: 4px;
    margin-bottom: 0;
  }

  button {
    svg {
      width: 24px;
      height: 18px;
      fill: ${({ theme }) => theme.headerColor};
    }
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

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 25px;
    height: 30px;
    stroke: ${skyColor};
    fill: transparent;
    margin-right: 16px;
  }

  span {
    padding-right: 16px;
  }
`

export const SignOutButton = styled(WalletNotConnectedButton)`
  width: 110px;
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
    margin-right: 155px;
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
