import styled from 'styled-components'
import { CardHover, cyanColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const TabWrapperStyled = styled.div<{ theme: MavrykTheme; backgroundImage?: string }>`
  padding: 24px 32px 40px 32px;
  position: relative;

  background: ${({ backgroundImage, theme }) =>
    backgroundImage ? `url(/images/dashboard/${backgroundImage}), ${theme.containerColor}` : theme.containerColor};
  background-size: auto;
  background-repeat: no-repeat;
  background-position: right bottom;
  border-radius: 10px;
  height: 530px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  svg {
    stroke: none;
    fill: ${({ theme }) => theme.containerColor};
  }

  .top {
    display: flex;
    width: 100%;
    justify-content: space-between;

    button {
      margin: 0 auto;
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
  padding: 0 20px;
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
    padding-top: 10px;
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
  padding-left: 20px;
  grid-template-columns: repeat(3, auto);
  flex-direction: column;
  margin-top: 25px;
  row-gap: 20px;
  column-gap: 50px;
  max-width: 600px;
`

export const OraclesContentStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  margin-top: 25px;

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
    max-width: 720px;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    cursor: pointer;

    .row {
      display: grid;
      grid-template-columns: 1.2fr 1.1fr 1.3fr 1.2fr;

      .value {
        height: 22px;
        transition: color 0.4s ease-in-out;
      }
    }
  }

  .padding-left {
    padding-left: 20px;
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
      bottom: 13px;
      left: 50%;
      transform: translateX(-50%);
      display: block;
      white-space: pre-line;
      padding: 4px 6px;
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
        margin-left: -8px;
        border-width: 8px;
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

export const VaultsContentStyled = styled.div<{ theme: MavrykTheme }>`
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

      &.chart-wrapper {
        width: 360px;
        position: absolute;
        right: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        top: 50%;
        transform: translateY(-63%);
      }

      .asset-lables {
        display: flex;
        max-height: 75px;
        overflow: auto;
        gap: 6px;
        flex-wrap: wrap;
        width: 100%;
        margin-top: 15px;
      }

      .asset-lable {
        padding-top: 2px;
        padding-bottom: 2px;
        border-bottom-left-radius: 6px;
        border-top-left-radius: 6px;
        max-width: 110px;
        width: 100%;
      }

      .asset-lable-text {
        font-weight: 600;
        font-size: 14px;
        line-height: 16px;
        color: ${({ theme }) => theme.dashboardTextColor};
        margin: 0;
        margin-left: 8px;
        line-height: 30px;
        padding-left: 10px;
        background-color: ${({ theme }) => theme.containerColor};
      }
    }

    .summary {
      display: flex;
      column-gap: 20px;
      margin-left: auto;
      justify-content: flex-end;
      margin-top: 13px;

      .name {
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
      }

      .value {
        font-weight: 600;
        font-size: 22px;
        line-height: 22px;
        color: ${({ theme }) => theme.dataColor};
        p {
          margin: 0;
        }
      }
    }
  }
`

export const FarmsContentStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  column-gap: 80px;
  margin-top: 70px;
  padding-left: 25px;
  overflow-x: auto;
  padding-bottom: 7px;

  a {
    position: relative;

    &::before {
      position: absolute;
      top: 0;
      right: -40px;
      width: 1px;
      height: 100%;
      content: '';
      background-color: ${({ theme }) => theme.footerColor};
    }

    &:last-child {
      &::before {
        display: none;
      }
    }
  }

  .empty-container {
    margin-left: 150px;
  }

  .card {
    width: 250px;
    flex: none;
    transition: 0.5s all;
    cursor: pointer;

    .top {
      margin-bottom: 20px;
      .name {
        color: ${({ theme }) => theme.dashboardTextColor};
        font-weight: 500;
        font-size: 12px;
        line-height: 12px;
        transition: 0.5s all;

        p {
          margin: 0;
        }

        .large {
          font-weight: 600;
          font-size: 18px;
          line-height: 18px;
          margin-bottom: 5px;
        }
      }

      > svg {
        width: 58px;
        height: 58px;
      }
    }

    .row-info {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
      .name {
        color: ${({ theme }) => theme.dashboardTextColor};
        font-weight: 600;
        font-size: 14px;
        line-height: 21px;
        transition: 0.5s all;
      }

      .value {
        color: ${({ theme }) => theme.dataColor};
        font-weight: 600;
        font-size: 14px;
        line-height: 21px;
        transition: 0.5s all;
      }
    }

    &:hover {
      .top {
        .name {
          color: ${({ theme }) => theme.textColorHovered};
        }
      }
      .row-info {
        .name {
          color: ${({ theme }) => theme.textColorHovered};
        }

        .value {
          color: ${({ theme }) => theme.textColorHovered};
        }
      }
    }
  }
`

export const PopularFeed = styled(CardHover)`
  margin-top: 0;
  padding: 12px 20px 12px 19px;
  border: 1px solid transparent;
`
