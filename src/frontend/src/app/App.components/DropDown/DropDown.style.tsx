import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const DropDownStyled = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  min-width: 226px;
  margin: 0 auto;
  position: relative;

  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorText};
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
  color: ${({ theme }) => theme.textColor};
  border-radius: 10px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;
  cursor: pointer;
  text-transform: capitalize;

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
  z-index: 11;
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
  margin-top: 8px;
  z-index: 2;
`

export const DropDownListItem = styled.li`
  list-style: none;
  height: 33px;
  display: flex;
  align-items: center;
  width: 100%;
  color: ${({ theme }) => theme.textColor};
  padding-left: 20px;
  padding-right: 10px;
  cursor: pointer;
  justify-content: space-between;
  text-transform: capitalize;

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
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    flex-shrink: 0;
    margin-right: 16px;
  }
`

export const DropdownWrap = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  padding: 16px 30px;
  align-items: center;

  h2 {
    font-weight: 600;
    font-size: 22px;
    line-height: 22px;
    color: ${({ theme }) => theme.textColor};

    & + div {
      width: 450px;
      margin-right: 0;
    }
  }
`

export const DropdownCard = styled(Card)`
  padding: 0;
  margin: 0;

  &.pending-dropdown {
    margin-bottom: 30px;
    margin-top: 30px;
  }

  &.satellite-governance-dropdown {
    margin-top: 30px;
  }
`
