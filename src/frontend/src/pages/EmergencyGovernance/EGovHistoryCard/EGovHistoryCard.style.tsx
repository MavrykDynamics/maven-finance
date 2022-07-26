import styled from 'styled-components/macro'
import { Card, royalPurpleColor, cyanColor, boxShadowColor, CardHover } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const EGovHistoryCardStyled = styled(CardHover)`
  width: 100%;
  border-radius: 10px;
  margin-bottom: 15px;
  margin-top: 0;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
`
export const EGovHistoryCardTopSection = styled.div<{ height: number; theme: MavrykTheme }>`
  width: 100%;
  display: grid;
  grid-template-columns: 180px 260px 150px auto 130px;
  padding: 20px 40px;
  padding-right: 26px;
`

export const EGovHistoryArrowButton = styled.div<{ theme: MavrykTheme }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  > svg {
    height: 12px;
    width: 16px;
    stroke: ${({ theme }) => theme.headerColor};
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
    word-break: break-all;
    padding-right: 16px;
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
  width: 100%;
  height: 0;
  justify-content: space-between;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  cursor: pointer;
  transition: height 0.3s ease-in-out; /* added */
  overflow: hidden;
  position: relative;

  h3 {
    margin: 0;
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
    color: ${({ theme }) => theme.headerColor};
  }

  ul {
    padding-left: 0;
  }

  p,
  li {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.headerSkyColor};
    list-style: none;
  }

  &::before {
    content: '';
    position: absolute;
    border-top: 1px solid ${royalPurpleColor};
    width: 100%;
    left: 0;
    top: 1px;
  }

  .accordion {
    padding: 20px 40px;
    text-align: left;
    width: 100%;
  }

  &.show {
    height: ${({ height }) => height}px;
  }
  &.hide {
    height: 0; /* changed */
  }
`
