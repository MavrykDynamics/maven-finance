import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, CardHeader } from 'styles'

export const SatelliteSideBarStyled = styled(Card)`
  padding: 24px 0;
  margin-top: 30px;
`

export const SideBarSection = styled.aside<{ theme: MavrykTheme }>`
  margin: 20px 0 40px;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorderColor};

  h2 {
    font-weight: 700;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.headerColor};
  }
  h3 {
    margin: 10px 0;
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.subTextColor};
  }
`

export const FAQLink = styled.div<{ theme: MavrykTheme }>`
  font-size: 12px;
  color: ${({ theme }) => theme.primaryColor};
  margin: 8px 0;

  > a {
    font-weight: 400;
    color: ${({ theme }) => theme.primaryColor};
  }
`

export const SideBarItem = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: ${({ theme }) => theme.subTextColor};
`
