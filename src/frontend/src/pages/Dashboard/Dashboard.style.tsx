import styled from 'styled-components/macro'
import { silverColor } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'

export const DashboardStyled = styled.div<{ theme: MavrykTheme }>`
  .top {
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    height: 240px;

    .tvlBlock {
      width: 50%;
      height: 100%;
      padding: 25px 0 0 30px;
      background: url('images/dashboardTVLbg.png'), ${({ theme }) => theme.dashboardTvlGradient};
      background-size: cover;
      background-repeat: no-repeat;
      border: 1px solid #503eaa;
      border-radius: 10px;

      h1 {
        color: ${silverColor};

        &:after {
          background-color: ${silverColor};
        }
      }

      > div {
        font-weight: 600;
        font-size: 32px;
        color: ${({ theme }) => theme.dataColor};
        margin-top: 30px;
      }
    }
  }
`
