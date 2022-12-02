import styled from 'styled-components'
import { cyanColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SmallBlockBase = styled.div<{ theme: MavrykTheme }>`
  width: calc(50% - 10px);
  height: 235px;
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  padding: 30px;

  h2 {
    font-size: 22px;
  }

  button {
    max-width: 190px;
    font-size: 16px;
  }

  .name {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.dataColor};
  }
`

export const MediumBlockBase = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  height: 382px;
  display: flex;
  flex-direction: column;

  .no-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    row-gap: 20px;

    span {
      font-weight: 600;
      font-size: 14px;
      color: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
    }
  }
`

export const PortfolioChartStyled = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  width: 810px;
  padding-bottom: 10px;
  position: relative;

  .chart-periods {
    position: absolute;
    top: 30px;
    right: 30px;
    width: 250px;

    button {
      width: 20%;
      font-size: 14px;
      padding-left: 10px;
      padding-right: 10px;

      &.selected {
        background: linear-gradient(90deg, #86d4c9 0.31%, #8d86eb 99.97%);
      }
    }
  }

  .last-seria {
    position: absolute;
    left: 30px;
    top: 85px;
    display: flex;
    flex-direction: column;
    color: ${({ theme }) => theme.dataColor};
    .mvk {
      font-weight: 600;
      font-size: 32px;

      .suffix {
        color: ${({ theme }) => theme.textColor};
      }
    }

    .usd {
      font-weight: 600;
      font-size: 16px;
    }

    p {
      margin: 0;
    }
  }
`

export const PortfolioWalletStyled = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  width: 260px;

  .wallet-info {
    display: flex;
    flex-direction: column;
    margin-top: 24px;

    .name {
      font-weight: 600;
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      font-weight: 600;
      font-size: 16px;
      color: ${({ theme }) => theme.dataColor};
      display: flex;
      column-gap: 7px;
      align-items: center;
    }
  }
`

export const MyRewardsStyled = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  background-image: url('/images/dashboard/dashboardPersonalMyRewards.svg?v=0'),
    ${({ theme }) => theme.dashboardTvlGradient};
  background-size: cover;
  background-repeat: no-repeat;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 40px 55px;
  column-gap: 45px;
  row-gap: 25px;

  > div {
    align-items: flex-end;
  }

  button {
    margin-left: auto;
    margin-top: -10px;
  }

  .stat-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .name {
      font-weight: 600;
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      font-weight: 700;
      font-size: 25px;
      color: ${({ theme }) => theme.dataColor};
      display: flex;
      align-items: flex-end;
      .suffix {
        font-weight: 600;
        font-size: 14px;
        color: ${({ theme }) => theme.textColor};
      }
    }
  }
`
export const EarnHistoryStyled = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  .top {
    display: flex;
    justify-content: space-between;
  }

  .grid {
    display: grid;
    grid-template-rows: 47px 47px;
    grid-template-columns: 1fr 1fr 1fr;
    margin-top: 25px;
    row-gap: 18px;
  }

  .switcher {
    display: flex;
    align-items: center;
    column-gap: 8px;
    height: 25px;
    > span {
      font-weight: 600;
      font-size: 16px;

      &.usd {
        color: ${({ theme }) => theme.valueColor};
      }

      &.mvk {
        color: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
      }
    }

    .toggler {
      position: relative;
      width: 45px;
      height: 25px;
    }

    label {
      position: absolute;
      top: 0;
      width: 46px;
      height: 25px;
      background-color: ${({ theme }) => theme.containerColor};
      border: 1px solid ${({ theme }) => theme.cardBorderColor};
      border-radius: 50px;
      cursor: pointer;
    }

    input {
      position: absolute;
      display: none;
    }

    .slider {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50px;
      transition: 0.3s;
    }

    .slider::before {
      content: '';
      position: absolute;
      top: 0;
      left: 3;
      width: 23px;
      height: 23px;
      border-radius: 50%;
      background-color: ${cyanColor};
      transition: 0.3s;
    }

    input:checked ~ .slider::before {
      transform: translateX(21px);
    }
  }

  .stat-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    > div {
      font-weight: 600;
    }
  }
`

export const LBHInfoBlock = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  .list {
    display: flex;
    flex-direction: column;
    row-gap: 24px;
    margin-top: 20px;
    overflow: auto;
    position: relative;
    width: calc(100% + 30px);
    padding-right: 30px;
  }
`

export const ListItem = styled.div<{ theme: MavrykTheme; columsTemplate: string }>`
  display: grid;
  grid-template-columns: ${({ columsTemplate }) => columsTemplate};
  position: relative;

  svg {
    height: 40px;
    width: 40px;
    fill: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
  }

  .list-part {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    p {
      margin: 0;
    }

    &.user {
      display: flex;
      justify-content: flex-end;
      flex-direction: row;
      column-gap: 15px;

      .user-info {
        display: flex;
        flex-direction: column;
        row-gap: 5px;

        .user-address {
          svg {
            width: 16px;
            height: 16px;
            fill: unset;
            stroke: ${({ theme }) => theme.dataColor};
          }
        }
      }
    }
  }

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    bottom: -10px;
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
  }
`

export const SatelliteStatusBlock = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  padding-bottom: 20px;

  .grid {
    margin-top: 40px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 50px);
    column-gap: 20px;
    row-gap: 25px;
    grid-template:
      'info space participation'
      'delegated fee oraclePart'
      'oracleStatus website website';

    .grid-item {
      display: flex;
      flex-direction: column;
      row-gap: 5px;

      p {
        margin: 0;
      }

      &.info {
        grid-area: info;
        flex-direction: row;

        .text {
          display: flex;
          flex-direction: column;
          row-gap: 5px;

          svg {
            width: 16px;
            height: 16px;
            fill: unset;
            stroke: ${({ theme }) => theme.dataColor};
          }
        }

        > svg,
        .satellite-avatar {
          height: 40px;
          width: 40px;
          fill: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
          margin-right: 10px;

          img {
            border-radius: 50%;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      &.space {
        grid-area: space;
      }

      &.participation {
        grid-area: participation;
      }

      &.delegated {
        grid-area: delegated;
      }

      &.fee {
        grid-area: fee;
      }

      &.oraclePart {
        grid-area: oraclePart;
      }

      &.oracleStatus {
        grid-area: oracleStatus;
      }

      &.website {
        grid-area: website;

        a {
          font-weight: 500;
          font-size: 14px;
          color: ${({ theme }) => theme.valueColor};
        }
      }
    }
  }

  > a {
    margin: 0 auto;
    margin-top: auto;
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.valueColor};
    position: relative;

    &::before {
      position: absolute;
      content: '';
      width: 475px;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      background: ${({ theme }) => theme.cardBorderColor};
      cursor: default;
    }
  }
`

export const DelegationStatusBlock = styled(SatelliteStatusBlock)<{ theme: MavrykTheme }>`
  .grid {
    grid-template-rows: repeat(2, 50px);
    column-gap: 15px;
    row-gap: 20px;
  }

  .delegated-to {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    color: ${({ theme }) => theme.textColor};
    margin-top: 25px;
  }
`

export const DashboardPersonalTabStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`
