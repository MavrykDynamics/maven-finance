import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const DropDownStyled = styled.div`
  width: 100%;
  min-width: 226px;
  margin: 0 auto;
  position: relative;
`

export const DropDownMenu = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  position: relative;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding-left: 16px;
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.cardBorderColor};
  color: ${({ theme }) => theme.headerColor};
  border-radius: 10px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;

  span {
    width: 50px;
    border-left: 1px solid ${({ theme }) => theme.headerColor};
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    margin-left: 16px;

    > svg {
      height: 15px;
      width: 20px;
      stroke: ${({ theme }) => theme.headerColor};
      stroke-width: 3px;
      fill: none;
      transition: 0.15s ease-in-out;

      &.open {
        transform: rotate(-180deg);
      }
    }
  }
`

export const DropDownListContainer = styled.div`
  position: absolute;
  width: 100%;
  top: 36px;
  left: 0;
`

export const DropDownList = styled.ul<{ theme: MavrykTheme }>`
  display: block;
  position: relative;
  height: min-content;
  padding: 8px;
  border-radius: 10px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  background-color: ${({ theme }) => theme.containerColor};
  font-weight: 500;
  margin-top: 8px;
`

export const DropDownListItem = styled.li`
  list-style: none;
  height: 33px;
  display: flex;
  align-items: center;
  width: 100%;
  color: ${({ theme }) => theme.headerColor};
  font-weight: 400;
  font-size: 14px;
  padding-left: 20px;
  padding-right: 10px;
  cursor: pointer;
  justify-content: space-between;

  svg {
    stroke: ${({ theme }) => theme.headerColor};
    width: 10px;
    height: 10px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.cardBorderColor};
  }
`

export const DropdownContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  > h4 {
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
    color: ${({ theme }) => theme.headerColor};
    flex-shrink: 0;
    margin-right: 16px;
  }
`
