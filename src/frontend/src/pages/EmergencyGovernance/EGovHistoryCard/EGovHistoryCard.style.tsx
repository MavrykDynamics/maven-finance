import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const EGovHistoryCardStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 100%;
  border-radius: 10px;
`
export const EGovHistoryCardTopSection = styled.div<{ height: number; theme: MavrykTheme }>`
  margin: 15px 15px 0 15px;
  padding: 20px 0;
  height: 100px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`

export const EGovHistoryCardDropDown = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
`
export const EGovHistoryCardLeftSideContainer = styled.div<{ theme: MavrykTheme }>``
export const EGovHistoryCardRightSideContainer = styled.div<{ theme: MavrykTheme }>`
  width: 40%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding-right: 35px;
`

export const EGovHistoryArrowButton = styled.div<{ theme: MavrykTheme }>`
  padding: 0 50px;
  > svg {
    height: 8px;
    width: 13px;
    stroke: ${({ theme }) => theme.primaryColor};
    stroke-width: 5px;
    fill: none;
  }
`

export const EGovHistoryCardTitleTextGroup = styled.div<{ theme: MavrykTheme }>`
  > h3 {
    font-size: 20px;
    font-weight: 600;
  }
  > p {
    margin-bottom: 0;
    color: ${({ theme }) => theme.subTextColor};
    font-weight: 600;
  }

  > svg {
    height: 8px;
    width: 13px;
    stroke: ${({ theme }) => theme.primaryColor};
    stroke-width: 5px;
    fill: none;
  }
`

export const CardDropDownContainer = styled.div<{ height: number; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.connectWalletBackgroundColor};
  width: 100%;
  height: 0;
  justify-content: space-between;
  align-items: center;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease-in-out; /* added */
  overflow: hidden;

  .accordion {
    padding: 10px 15px 15px; /* changed */
  }

  &.show {
    height: ${({ height }) => height}px;
  }
  &.hide {
    height: 0; /* changed */
  }
`
