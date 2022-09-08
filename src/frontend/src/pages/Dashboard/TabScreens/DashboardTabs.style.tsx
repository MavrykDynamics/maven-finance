import styled from 'styled-components'
import { cyanColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const TabWrapperStyled = styled.div<{ theme: MavrykTheme; backgroundImage?: string }>`
  padding: 24px 32px 40px 32px;
  background: ${({ theme }) => theme.containerColor};

  background: ${({ backgroundImage, theme }) =>
    backgroundImage ? `url(images/dashboard/${backgroundImage}), ${theme.containerColor}` : theme.containerColor};
  background-size: auto;
  background-repeat: no-repeat;
  background-position: right bottom;
  border-radius: 10px;
  height: 530px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .top {
    display: flex;
    width: 100%;
    justify-content: space-between;

    button {
      width: fit-content;
      padding: 0 50px;
    }

    h1 {
      color: ${({ theme }) => theme.dashboardTextColor};

      &:after {
        background-color: ${({ theme }) => theme.dashboardTextColor};
      }
    }
  }

  .descr {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    max-width: 600px;

    .title {
      font-weight: 700;
      font-size: 18px;
      line-height: 18px;
      color: ${({ theme }) => theme.dashboardTextColor};
    }

    .text {
      font-weight: 500;
      font-size: 14px;
      line-height: 21px;

      a {
        color: ${cyanColor};
        text-decoration: underline;
      }
    }
  }

  &.oracles {
    .descr {
      max-width: 720px;
    }
  }

  &.vaults {
    .descr {
      max-width: 100%;
    }
  }
`

export const LendingContentStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  padding: 0 25px;
  column-gap: 48px;
  margin-bottom: 40px;
  position: relative;

  .spacer {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: -25px;
    height: 280px;
    width: 1px;
    background-color: ${({ theme }) => theme.footerColor};
  }

  .left,
  .right {
    padding-top: 30px;
    width: 45%;
  }

  .left,
  .right {
    .stats-row {
      margin-top: 54px;
      display: flex;
      justify-content: space-between;
    }
  }
`

export const SatellitesContentStyled = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: repeat(3, auto);
  flex-direction: column;
  margin-top: 42px;
  row-gap: 20px;
  column-gap: 50px;
  max-width: 600px;
`

export const OraclesContentStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;

  .top {
    width: fit-content;
    column-gap: 50px;

    .value {
      height: 25px;
    }
  }

  .block-name {
    margin-top: 30px;
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${({ theme }) => theme.dashboardTextColor};
  }

  .feeds-grid {
    margin-top: 20px;
    max-width: 650px;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    .row {
      display: grid;
      grid-template-columns: repeat(4, auto);

      .value {
        height: 25px;
      }
    }
  }
`

export const TreasuryContentStyled = styled.div<{ theme: MavrykTheme }>`
  padding-left: 20px;
  margin-top: 25px;

  .top {
    width: fit-content;
    column-gap: 50px;

    .value {
      height: 25px;
    }
  }

  .container {
    display: flex;
    margin-top: 32px;
    column-gap: 55px;

    > div {
      width: 50%;

      .table-wrapper {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        row-gap: 13px;

        .row {
          display: flex;
          width: 100%;
          justify-content: space-between;
          position: relative;

          > div {
            color: ${({ theme }) => theme.dashboardTextColor};
            font-weight: 600;
            width: 33%;
            transition: 0.4s all;

            P {
              margin: 0;
            }
          }

          > div:last-child {
            text-align: right;
            padding-right: 8px;
          }

          &:not(.column-names) {
            > div {
              color: ${({ theme }) => theme.dataColor};
            }

            > div:last-child {
              padding-right: 5px;
            }

            &:before {
              position: absolute;
              content: '';
              bottom: -7px;
              width: 100%;
              height: 1px;
              background-color: ${({ theme }) => theme.dataColor};
              transition: 0.4s all;
            }
          }

          &:last-child {
            &:before {
              display: none;
            }
          }

          &:hover {
            > div {
              color: ${({ theme }) => theme.navTitleColor};
            }

            &:before {
              background-color: ${({ theme }) => theme.navTitleColor};
            }
          }
        }

        .table-content {
          display: flex;
          flex-direction: column;
          max-height: 140px;
          overflow-y: auto;
          row-gap: 17px;
        }
      }

      .vesting {
      }
    }
  }
`

export const TreasuryVesting = styled.div<{
  theme: MavrykTheme
  totalPersent: number
  claimedColor: string
  totalColor: string
}>`
  padding: 30px 20px 33px 20px;
  border: 0.5px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  margin-top: 20px;

  .vest-stat {
    display: flex;
    justify-content: space-between;
    margin: 7px 0;

    .name {
      color: ${({ theme }) => theme.dashboardTextColor};
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      display: flex;
      column-gap: 10px;

      .color {
        width: 16px;
        height: 16px;
        border-radius: 50%;

        &.claimed {
          background-color: ${({ theme, claimedColor }) => theme[claimedColor]};
        }

        &.total {
          background-color: ${({ theme, totalColor }) => theme[totalColor]};
        }
      }
    }

    .value {
      color: ${({ theme }) => theme.dataColor};
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;

      p {
        margin: 0;
      }
    }
  }

  .ratio {
    margin-top: 30px;
    display: flex;

    > div {
      position: relative;
      cursor: pointer;
      height: 4px;

      &:hover {
        .hoverValue {
          visibility: visible;
          opacity: 1;
        }
      }
    }

    .hoverValue {
      font-size: 12px;
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: block;
      white-space: pre-line;
      padding: 3px 5px;
      border-radius: 3px;
      line-height: 15px;
      background: #503eaa;
      color: #9ea9e8;
      opacity: 0;
      transition: 0.3s all;
      visibility: hidden;
      width: max-content;
      max-width: 330px;

      &::after {
        content: ' ';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #503eaa transparent transparent transparent;
      }

      &:hover {
        visibility: visible;
        opacity: 1;
      }
    }

    .claimed {
      background-color: ${({ theme, claimedColor }) => theme[claimedColor]};
      width: ${({ totalPersent }) => `${100 - totalPersent}%`};
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }

    .total {
      width: ${({ totalPersent }) => `${totalPersent}%`};
      background-color: ${({ theme, totalColor }) => theme[totalColor]};
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }
`
