import styled, { css } from 'styled-components/macro'
import { cyanColor, skyColor } from 'styles'
import { BUTTON_RADIUS } from 'styles/constants'
import { MavrykTheme } from 'styles/interfaces'

// Common style parts START
const VISIBLE_PART_CONNECTED_WALLET = (theme: MavrykTheme, isMobileDetails?: boolean) => `
.top-visible-part {
  display: flex;
  align-items: center;
  column-gap: 10px;
  cursor: pointer;
  height: 100%;

  var {
    font-weight: 400;
    font-size: 14px;
    color: ${theme.headerSkyColor};
    transition: 0.6s all;
  }

  .end-icon {
    height: 15px;
    width: 10px;
    transform: rotate(-90deg);
    margin-left: 3px;
    transition: 0.6s all;
    stroke: ${theme.headerSkyColor};
  }

  .openLink {
    height: 15px;
    width: 20px;
  }

  .wallet {
    width: 22px;
    height: 20px;
    stroke: ${theme.headerSkyColor};
    fill: transparent;
    transition: 0.6s all;
  }

  ${
    isMobileDetails
      ? ''
      : ` &:hover {
      var, .wallet, .end-icon {
        color: ${cyanColor};
        stroke: ${cyanColor};

        div {
          color: ${cyanColor};
        }

        svg {
          stroke: ${cyanColor};
        }
      }
    }
  `
  }

  @media screen and (max-width: 870px) {
    var {
      font-size: 20px;
    }

    .openLink {
      height: 20px;
      width: 20px;
    }
  
    .wallet {
      width: 25px;
      height: 20px;
    }
  }
}
`

const BUTTONS_WRAPPER_CONNECTED_WALLET = `
.buttons-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
`
// Common style parts END

export const ConnectWalletStyled = styled.div<{ theme: MavrykTheme }>`
  text-align: center;
  border-radius: ${BUTTON_RADIUS};
  margin: 10px auto 34px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  column-gap: 20px;
`

export const ConnectedWalletStyled = styled.div<{ theme: MavrykTheme }>`
  height: 100%;
  display: flex;
  align-items: center;

  ${({ theme }) =>
    css`
      ${VISIBLE_PART_CONNECTED_WALLET(theme)}
    `}

  &:hover {
    .end-icon {
      transform: rotate(90deg);
    }
  }

  .wallet-details {
    position: absolute;
    visibility: hidden;
    padding: 30px;
    top: 85px;
    opacity: 0;
    right: 15px;
    transition: 0.6s all;
    width: 375px;
    background: #160e3f;
    border: 1px solid #86d4c9;
    border-radius: 10px;

    &.visible {
      opacity: 1;
      visibility: visible;
    }

    &.mobile {
      display: none;
    }
  }

  ${BUTTONS_WRAPPER_CONNECTED_WALLET}
`

export const MobileDetailsStyled = styled.div<{ theme: MavrykTheme }>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 15;
  background: #160e3f;
  padding-top: 60px;

  .close {
    position: absolute;
    top: 27px;
    right: 22px;
    cursor: pointer;

    svg {
      width: 26px;
      height: 21px;
      stroke: #8d86eb;
      transition: 0.6s all;
    }

    &:hover {
      svg {
        stroke: ${cyanColor};
      }
    }
  }

  ${({ theme }) =>
    css`
      ${VISIBLE_PART_CONNECTED_WALLET(theme, true)}
    `}

  .top-visible-part {
    width: fit-content;
    margin: 25px auto;
  }

  .details {
    margin: 0 auto;
    width: 88%;
    max-width: 500px;

    ${BUTTONS_WRAPPER_CONNECTED_WALLET}

    .buttons-wrapper {
      column-gap: 25px;
    }
  }

  @media screen and (max-width: 450px) {
    padding-top: 30px;

    .details {
      margin: 0 auto;
      width: 88%;
    }
  }
`

export const ConnectedWalletDetailsItemStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  position: relative;

  .left-part {
    display: flex;
    flex-direction: column;

    > div {
      &.main {
        font-size: 20px;
        line-height: 20px;
        color: #8d86eb;
      }

      &.subtext {
        font-weight: 600;
        font-size: 12px;
        line-height: 22px;
        color: #77a4f2;
      }

      p {
        margin: 0;
        white-space: nowrap;
        width: fit-content;
      }
    }
  }

  .btn-wrapper {
    display: flex;
    align-items: center;
    svg {
      width: 6px;
      height: 13px;
      transform: rotate(180deg);
    }
    &:hover {
      svg {
        stroke: ${cyanColor};
      }
    }
  }

  &:not(:nth-last-child(2)):before {
    content: '';
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: #503eaa;
  }
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
  border-radius: ${BUTTON_RADIUS};
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  color: ${({ theme }) => theme.containerColor};
  background-color: ${({ theme }) => theme.actionPrimaryBtnColor};

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 25px;
    height: 30px;
    stroke: ${({ theme }) => theme.containerColor};
    fill: transparent;
    margin-right: 16px;
  }

  span {
    padding-right: 16px;
  }
`

export const SignOutButton = styled(WalletNotConnectedButton)`
  width: 110px;
  margin: 0;
`

export const SimpleConnectedButton = styled.div<{ theme: MavrykTheme }>`
  margin: 0 auto;
  height: 50px;
  cursor: pointer;
  color: ${({ theme }) => theme.containerColor};
  background-color: ${({ theme }) => theme.actionPrimaryBtnColor};
  border-radius: ${BUTTON_RADIUS};
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  font-size: 12px;
  width: 220px;

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${({ theme }) => theme.containerColor};
    vertical-align: top;
  }

  > div {
    display: inline-block;
    margin-right: 9px;
    font-weight: 600;
    color: ${({ theme }) => theme.containerColor};
  }
`

export const ConnectWalletInfoStyled = styled.blockquote<{ theme: MavrykTheme }>`
  height: 100px;
  border-radius: 10px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background-color: ${({ theme }) => theme.connectInfoColor};
  margin-top: 32px;

  p {
    width: 650px;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.headerColor};
    margin-top: 2px;
    margin-bottom: 2px;

    & + div {
      margin: 0;
    }
  }
`

export const ButtonBar = styled.div`
  display: flex;
  align-items: center;

  .connect-wallet {
    margin: 0;
  }
`

export const ConnectWalletClose = styled.button<{ theme: MavrykTheme }>`
  background: transparent;
  border: none;
  padding: 0;
  margin-left: 46px;
  cursor: pointer;

  .close-connect-wallet {
    stroke: ${({ theme }) => theme.headerColor};
    width: 14px;
    height: 14px;
  }
`

export const WertIo = styled.div`
  width: 100%;
  background: #160e3f;
  padding: 30px;
  border-radius: 10px;
  border: 1px solid #86d4c9;
  height: 100%;
  display: flex;
  justify-content: center;

  @media (max-width: 550px) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px 0px;
    border-radius: 0;
    border: none;
  }
`
