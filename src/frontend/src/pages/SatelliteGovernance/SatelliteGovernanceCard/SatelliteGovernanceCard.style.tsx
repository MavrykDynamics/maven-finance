import styled from 'styled-components/macro'
import { CardHover, royalPurpleColor, cyanColor, boxShadowColor, headerColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const SatelliteGovernanceCardTitleTextGroup = styled.div<{ theme: MavrykTheme }>`
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

  .inner {
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

  .first-big-letter {
    &::first-letter {
      text-transform: uppercase;
    }
  }
`

export const SatelliteGovernanceCardDropDown = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
  display: flex;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  padding: 20px 40px;
  .purpose {
    word-break: break-all;
  }

  .description {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 37px;
  }

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

  .view-satellite {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${headerColor};
  }

  .brop-btn {
    width: 250px;
    margin-top: 40px;
    display: block;
  }

  .voting-ends {
    color: ${cyanColor};
    font-weight: 700;
    font-size: 14px;
    line-height: 21px;
    margin-top: 10px;
    display: block;
  }

  .voting-buttons {
    margin-bottom: 20px;
    margin-top: 64px;
    justify-content: space-between;
    padding-top: 0;

    button {
      width: 31%;
    }
  }

  .voting-block {
    width: 440px;
    margin-left: auto;
  }

  .voting-bar {
    margin-bottom: 54px;
  }
`
