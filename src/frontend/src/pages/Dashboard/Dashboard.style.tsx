import styled from 'styled-components/macro'
import { silverColor } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'

export const DashboardStyled = styled.div<{ theme: MavrykTheme }>`
  .top {
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
        color: ${({ theme }) => theme.blockNameTitleColor};

        &:after {
          background-color: ${({ theme }) => theme.blockNameTitleColor};
        }
      }
    }

    .tvlBlock {
      background: url('images/dashboardTVLbg.png'), ${({ theme }) => theme.dashboardTvlGradient};
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

        .stat {
          display: flex;
          flex-direction: column;
          row-gap: 4px;

          .name {
            font-weight: 600;
            font-size: 14px;
            color: ${({ theme }) => theme.blockNameTitleColor};
          }

          .value {
            display: flex;
            color: ${({ theme }) => theme.dataColor};
            font-weight: 600;
            font-size: 16px;
            column-gap: 4px;
            height: 36px;
            align-items: center;

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
                color: '#FF4343';
                background: rgba(174, 48, 39, 0.4);
              }
            }
          }
        }
      }
    }
  }

  .dashboard-navigation {
    display: flex;
    margin: 30px 0 10px 0;
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
