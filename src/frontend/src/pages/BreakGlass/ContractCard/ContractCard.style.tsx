import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const ContractCardStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 300px;
  border-radius: 10px;
  padding-top: 20px;
  margin-top: 15px;

  &.accordionHide {
    height: 125px;
  }
  &.accordionHide {
    height: max-content;
  }
`
export const CardTopSection = styled.div<{ theme: MavrykTheme }>`
  padding: 0 20px;
  margin-bottom: 20px;
  height: 50px;
`

export const TitleStatusContainer = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
`

export const DropDownContainer = styled.div<{ height: number; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.connectWalletBackgroundColor};
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 35px; /* changed */
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  cursor: pointer;
  padding: 0 10px;
  transition: all 0.3s ease-in-out; /* added */
  overflow: hidden;

  span {
    padding: 12px 0;
    > svg {
      height: 8px;
      width: 13px;
      stroke: ${({ theme }) => theme.primaryColor};
      stroke-width: 5px;
      fill: none;
    }
  }

  .accordion {
    padding: 10px 15px 15px; /* changed */
  }

  &.show {
    height: ${({ height }) => height}px;
  }
  &.hide {
    height: 35px; /* changed */
  }
`
export const EntrypointNameWithStatus = styled.p<{ status: boolean; theme: MavrykTheme }>`
  font-weight: 500;
  font-size: 16px;
  color: ${({ status, theme }) => (status ? theme.upColor : theme.downColor)};
  margin: 6px 0;
`
