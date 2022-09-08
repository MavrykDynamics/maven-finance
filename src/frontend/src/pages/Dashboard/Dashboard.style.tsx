import styled from 'styled-components/macro'
import { silverColor } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'

export const DashboardStyled = styled.div<{ theme: MavrykTheme }>`
  > .top {
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    height: 240px;
    column-gap: 20px;

    > div {
      width: 50%;
      height: 100%;
      border: 1px solid #503eaa;
      padding: 25px 0 0 30px;
      border-radius: 10px;

      h1 {
        color: ${({ theme }) => theme.dashboardTextColor};

        &:after {
          background-color: ${({ theme }) => theme.dashboardTextColor};
        }
      }
    }

    .tvlBlock {
      background: url('images/dashboard/dashboardTVLbg.png'), ${({ theme }) => theme.dashboardTvlGradient};
      background-size: cover;
      background-repeat: no-repeat;

      > div {
        font-weight: 600;
        font-size: 32px;
        color: ${({ theme }) => theme.dataColor};
        margin-top: 30px;
      }
    }

    .mvkStats {
      background-color: ${({ theme }) => theme.containerColor};

      .statsWrapper {
        margin-top: 15px;
        display: grid;
        grid-template-columns: repeat(3, auto);
        column-gap: 30px;
        row-gap: 20px;
      }
    }
  }

  .dashboard-navigation {
    display: flex;
    margin: 30px 0 15px 0;
    column-gap: 15px;

    > a {
      font-size: 14px;
      line-height: 17px;
      font-weight: 500;
      position: relative;
      transition: 0.3s all;
      color: ${({ theme }) => theme.navTitleColor};

      &.selected {
        &:before {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          transition: 0.3s all;
          content: '';
          width: 30px;
          height: 1px;
          background-color: ${({ theme }) => theme.navLinkSubTitleActive};
        }
        color: ${({ theme }) => theme.navLinkSubTitleActive};
      }
    }
  }
`

export const StatBlock = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  position: relative;

  > svg {
    height: 45px;
    width: 45px;
    position: absolute;
    top: 0;
    left: 0;
  }

  &.icon-first {
    padding-left: 50px;
  }

  .name {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.dashboardTextColor};
  }

  .value {
    display: flex;
    color: ${({ theme }) => theme.dataColor};
    font-weight: 600;
    font-size: 16px;
    column-gap: 4px;
    height: 36px;
    align-items: center;

    p {
      margin: 0;
    }

    svg {
      width: 24px;
      height: 24px;
      margin-right: 7px;
    }

    .impact {
      border-radius: 5px;
      font-weight: 400;
      font-size: 12px;
      padding: 2px 3px;
      height: fit-content;

      &.up {
        color: #4bcf83;
        background: rgba(39, 174, 96, 0.4);
      }

      &.down {
        color: #ff4343;
        background: rgba(174, 48, 39, 0.4);
      }
    }
  }

  &.large {
    .name {
      font-size: 18px;
    }

    .value {
      font-weight: 700;
      font-size: 24px;
      .impact {
        font-size: 20px;
        padding: 2px 3px;
        margin-left: 5px;
      }
    }
  }
`

export const BlockName = styled.div`
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
  color: ${({ theme }) => theme.dashboardTextColor};
`
