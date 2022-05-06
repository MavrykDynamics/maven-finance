import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const DropDownStyled = styled.div`
  width: 100%;
  min-width: max-content;
  margin: 0 auto;
`

export const DropDownMenu = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  position: relative;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 12px 16px 12px 16px;
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;
  background-color: ${({ theme }) => theme.containerColor};

  span {
    padding: 12px;
    > svg {
      height: 8px;
      width: 13px;
      stroke: ${({ theme }) => theme.subTextColor};
      stroke-width: 5px;
      fill: none;
    }
  }
`

export const DropDownListContainer = styled.div`
  position: fixed;
  width: 100%;
`

export const DropDownList = styled.ul<{ theme: MavrykTheme }>`
  width: max-content;
  display: block;
  position: relative;
  height: min-content;
  padding: 12px 16px 12px 16px;
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;
  background-color: ${({ theme }) => theme.containerColor};
  font-weight: 500;
  &:first-child {
    padding-top: 0.8em;
  }
`

export const DropDownListItem = styled.li`
  list-style: none;
  margin-bottom: 0.8em;
`

export const DropdownContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  > h4 {
    margin-right: 15px;
    white-space: nowrap;
    font-weight: 600;
  }

  #dropDownListContainer {
  }
`
