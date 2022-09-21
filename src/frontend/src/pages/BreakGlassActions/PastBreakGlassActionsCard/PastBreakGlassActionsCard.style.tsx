import styled from 'styled-components/macro'
import { royalPurpleColor, cyanColor, headerColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const PastBreakGlassActionsCardTitleTextGroup = styled.div<{ theme: MavrykTheme }>`
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

export const PastBreakGlassActionsCardCardDropDown = styled.div<{
  height: number;
  theme: MavrykTheme;
}>`
  width: 100%;
  height: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: height 0.3s ease-in-out; /* added */

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
    font-size: 16px;
    line-height: 24px;
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

  .card {
    padding: 20px 23.5px 40px 40px;
  }

  .main-block {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .purpose {
    margin-bottom: 25px;
    width: 540px;
  }

  .description {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 37px;
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
    display: flex;
    justify-content: space-between;
    padding-top: 34px;
  }

  .voting-buttons-right-block {
    display: flex;
    justify-content: space-between;
    width: 440px;

    button {
      width: 136px;
    }
  }

  .voting-block {
    width: 440px;
    margin-left: auto;
  }

  .voting-container {
    margin-bottom: 0;
  }

  .quorum-bar {
    margin-left: auto;
    margin-right: auto;
  }

  &.show {
    height: ${({ height }) => height}px;
  }

  &.hide {
    height: 0; /* changed */
  }
`
