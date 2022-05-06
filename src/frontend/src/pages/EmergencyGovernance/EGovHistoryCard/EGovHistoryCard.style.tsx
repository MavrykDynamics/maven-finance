import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const EGovHistoryCardStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  width: 100%;
  border-radius: 10px;
`
export const EGovHistoryCardTopSection = styled.div<{ height: number; theme: MavrykTheme }>`
  margin: 15px 15px 0 15px;
  height: 100px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: 20px 15px;
`

export const EGovHistoryArrowButton = styled.div<{ theme: MavrykTheme }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  > svg {
    height: 8px;
    width: 13px;
    stroke: ${({ theme }) => theme.primaryColor};
    stroke-width: 5px;
    fill: none;
  }
`

export const EGovHistoryCardTitleTextGroup = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  > h3 {
    font-size: 16px;
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

  &.statusFlag {
    justify-content: center;
    align-items: center;
    display: inline-flex;
    max-width: 90%;
  }
`

export const EGovHistoryCardDropDown = styled.div<{ height: number; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.connectWalletBackgroundColor};
  width: 100%;
  height: 0;
  justify-content: space-between;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease-in-out; /* added */
  overflow: hidden;

  .accordion {
    padding: 10px 15px 15px; /* changed */
    text-align: left;
  }

  &.show {
    height: ${({ height }) => height}px;
  }
  &.hide {
    height: 0; /* changed */
  }
`
