import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { headerColor } from '../../../styles/colors'

export const AccordeonWrapper = styled.div<{ theme: MavrykTheme }>`
  transition: 0.5s all;
`

export const AccordeonToggler = styled.div<{ theme: MavrykTheme }>`
  display: flex;

  justify-content: center;
  align-items: center;
  padding-top: 14px;
  padding-bottom: 10px;
  cursor: pointer;
  font-weight: 400;
  font-size: 16px;
  color: ${headerColor};

  .accordeon-icon {
    width: 16px;
    height: 12px;
    fill: ${headerColor};
    margin-left: 7px;
  }
`

export const AccordeonContent = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  height: 100%;
  max-height: 0;
  height: 185px;
  overflow-y: scroll;
  padding-left: 26px;
  padding-bottom: 16px;
  row-gap: 8px;
  flex-direction: column;
  transition: 0.5s all;

  opacity: 0;
  transition: opacity 0.5s max-height 0.4s ease-in-out;
  &.expaned {
    opacity: 1;
    max-height: 185px;
  }
`

export const AccordeonItem = styled.div<{ status: boolean; theme: MavrykTheme }>`
  font-weight: 400;
  font-size: 14px;
  margin: 5px 0;
  color: ${({ status, theme }) => (status ? theme.upColor : theme.downColor)};

  &:last-child {
    margin-bottom: 0;
  }
  &:first-child {
    margin-top: 0;
  }
`
