import styled from 'styled-components'
import { cyanColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SmallBlockBase = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  height: 235px;
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  padding: 30px;

  h1 {
    font-size: 22px;
  }

  button {
    max-width: 190px;
    font-size: 16px;
  }
`

export const MyRewardsStyled = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  background-image: url('/images/dashboard/dashboardPersonalMyRewards.svg?v=0'),
    ${({ theme }) => theme.dashboardTvlGradient};
  background-size: cover;
  background-repeat: no-repeat;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 50px 55px;

  > div {
    align-items: flex-end;
  }

  button {
    margin-left: auto;
  }

  .stat-block {
    margin-top: 25px;
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

    .name {
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      font-size: 16px;
      color: ${({ theme }) => theme.dataColor};
    }
  }
`
