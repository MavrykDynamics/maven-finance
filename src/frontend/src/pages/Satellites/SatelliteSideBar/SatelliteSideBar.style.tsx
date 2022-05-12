import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, CardHeader } from 'styles'

export const SatelliteSideBarStyled = styled(Card)`
  padding: 24px 0;
  margin-top: 30px;

  h2 {
    font-weight: 700;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.headerColor};
  }
`

export const SideBarSection = styled.aside<{ theme: MavrykTheme }>`
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorderColor};

  button {
    margin-bottom: 38px;
  }
`

export const FAQLink = styled.div<{ theme: MavrykTheme }>`
  font-size: 14px;
  color: ${({ theme }) => theme.headerColor};
  margin: 8px 0;

  > a {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.headerColor};
    text-decoration: underline;
  }
`

export const SideBarItem = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: ${({ theme }) => theme.subTextColor};

  h3 {
    margin: 10px 0;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${({ theme }) => theme.headerSkyColor};
    margin-bottom: 2px;
  }

  var * {
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${({ theme }) => theme.valueColor};

    svg {
      stroke: ${({ theme }) => theme.valueColor};
    }
  }
`

export const SideBarFaq = styled.div<{ theme: MavrykTheme }>`
  padding: 0 20px;
`
