import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const SmallBlockBase = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  height: 235px;
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  display: grid;
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

  grid-template-columns: 1fr 1fr;
  grid-template-rows: 50px 55px;

  > div {
    align-items: flex-end;
  }

  button {
    margin-left: auto;
  }
`
export const EarnHistoryStyled = styled(SmallBlockBase)<{ theme: MavrykTheme }>``
