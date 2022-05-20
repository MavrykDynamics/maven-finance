import styled from 'styled-components/macro'
import { Card } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const EGovHistoryCardStyled = styled(Card)<{ theme: MavrykTheme }>`
  width: 100%;
  border-radius: 10px;
  margin-bottom: 15px;
  margin-top: 0;
  padding: 0;
  cursor: pointer;
`
export const EGovHistoryCardTopSection = styled.div<{ height: number; theme: MavrykTheme }>`
  width: 100%;
  display: grid;
  grid-template-columns: 180px 260px 150px 110px auto 120px;
  padding: 20px 40px;
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
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.headerSkyColor};
  }
  > p {
    margin-bottom: 0;
    margin-top: 0;
    color: ${({ theme }) => theme.valueColor};
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
  }

  > svg {
    height: 8px;
    width: 13px;
    stroke: ${({ theme }) => theme.valueColor};
    stroke-width: 5px;
    fill: none;
  }

  &.statusFlag {
    margin-left: auto;
    justify-content: center;
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
