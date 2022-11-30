import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const ChartTooltip = styled.div<{ theme: MavrykTheme }>`
  padding: 6px 10px;
  text-align: center;

  font-weight: 600;
  font-size: 15px;
  line-height: 15px;

  color: ${({ theme }) => theme.secondaryColor};
  background: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.secondaryColor};
  border-radius: 10px;

  div {
    font-weight: 500;
    font-size: 9px;
    line-height: 18px;
    color: ${({ theme }) => theme.headerColor};
  }
`

export const Plug = styled.div`
  div {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 60px;

    .icon-cow {
      position: absolute;
      width: 73px;
      height: 70px;
    }

    .icon-stars {
      width: 238px;
      height: 82px;
    }
  }

  p {
    margin-top: 55px;

    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    text-align: center;
    color: ${({ theme }) => theme.headerColor};
  }
`

export const ChartStyled = styled.div<{ theme: MavrykTheme }>`
  width: fit-content;
  height: fit-content;
  position: relative;
  overflow: hidden;
  width: 100%;

  &.portfolio {
    margin-top: auto;
  }
`

export const TradingViewTooltipStyled = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  z-index: 100;
  padding: 7px 10px 7px 10px;
  background: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.secondaryColor};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 5px;
  top: 0;
  left: 0;
  transition: transform 50ms ease-in-out;
  transform: translate(var(--translateX, 0), var(--translateY, -100px));
  pointer-events: none;

  .value {
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.headerColor};
    white-space: pre;
    p {
      margin: 0;
    }
  }

  .date {
    font-weight: 600;
    font-size: 12px;
    color: ${({ theme }) => theme.textColor};
    white-space: pre;
  }
`
