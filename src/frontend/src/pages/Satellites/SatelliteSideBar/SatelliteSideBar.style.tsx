import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const SatelliteSideBarStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  padding: 20px;
  margin-top: 30px;
  border-radius: 10px;
  height: fit-content;
`

export const SideBarSection = styled.div<{ theme: MavrykTheme }>`
  margin: 20px 0 40px;

  h2 {
    margin: 10px 0;
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.subTextColor};
  }
  h3 {
    margin: 10px 0;
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.subTextColor};
  }

  div {
    display: flex;
    justify-content: space-between;
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
