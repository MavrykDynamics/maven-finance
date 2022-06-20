import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { headerColor, royalPurpleColor } from '../../../styles/colors'

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
    margin-left: 7px;

    &.down {
      transform: rotate(180deg);
    }
  }
`

export const AccordeonContent = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  height: 100%;
  max-height: 0;
  height: 185px;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-left: 30px;
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

  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0);
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
  &::-webkit-scrollbar {
    width: 15px;
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-clip: padding-box;
    border-left: 5px solid rgba(0, 0, 0, 0);
    border-right: 5px solid rgba(0, 0, 0, 0);
    border-radius: 6px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: ${royalPurpleColor};
  }
`

export const AccordeonItem = styled.div<{ status: boolean; theme: MavrykTheme }>`
  font-weight: 400;
  font-size: 14px;
  margin: 5px 0;
  color: ${({ status, theme }) => (status ? theme.upColor : theme.downColor)};

  .trunkated_text {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &:last-child {
    margin-bottom: 0;
  }
  &:first-child {
    margin-top: 0;
  }
`
