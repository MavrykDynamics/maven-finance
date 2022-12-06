import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { cyanColor, headerColor, royalPurpleColor } from 'styles/colors'

export const AccordionWrapper = styled.div<{ theme: MavrykTheme }>`
  transition: 0.5s all;
`

export const AccordionToggler = styled.div<{ theme: MavrykTheme }>`
  display: flex;

  justify-content: center;
  align-items: center;
  padding-top: 20px;
  padding-bottom: 4vpx;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  color: ${cyanColor};

  svg {
    stroke: ${cyanColor};
  }

  .accordion-icon {
    width: 16px;
    height: 12px;
    margin-left: 7px;

    &.down {
      transform: rotate(180deg);
    }
  }
`

export const AccordionContent = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  height: 100%;
  max-height: 0;
  height: fit-content;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-left: 30px;
  padding-bottom: 16px;
  row-gap: 8px;
  flex-direction: column;
  transition: 0.5s all;

  opacity: 0;
  transition: opacity 0.5s max-height 0.4s ease-in-out;

  &.expanded {
    opacity: 1;
    max-height: 185px;
    margin-top: 10px;
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

export const AccordionItem = styled.div<{ status: boolean; theme: MavrykTheme }>`
  font-weight: 400;
  font-size: 14px;
  margin: 5px 0;
  color: ${({ status, theme }) => (status ? theme.downColor : theme.upColor)};

  .truncated_text {
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
