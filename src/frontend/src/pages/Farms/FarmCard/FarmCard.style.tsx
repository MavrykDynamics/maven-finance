import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const FarmCardStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 28%;
`

export const FarmCardTopSection = styled.div<{ theme: MavrykTheme }>`
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: max-content;
  > div {
    margin: 5px 0;
    padding: 5px 0;
  }
`
export const FarmCardTokenLogoContainer = styled.div<{ theme: MavrykTheme }>`
  height: 50px;
  align-items: center;
  position: relative;
  width: 50px;
  > img {
    align-items: center;
    justify-content: center;
    position: absolute;
  }
`

export const FarmCardFirstTokenIcon = styled.img<{ theme: MavrykTheme }>`
  height: 40px;
  width: 40px;
  bottom: 0;
  right: 0;
  align-self: flex-end;
  z-index: 1;
`
export const FarmCardSecondTokenIcon = styled.img<{ theme: MavrykTheme }>`
  height: 35px;
  width: 35px;
  top: 0;
  left: 0;
  align-self: flex-end;
`

export const FarmCardContentSection = styled.div<{ theme: MavrykTheme }>`\
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  > div > p {
    font-size: 14px;
    font-weight: 600;
  }
  
  div:nth-child(2) {
    text-align: right;
  }
`
export const FarmTitleSection = styled.div<{ theme: MavrykTheme }>`
  width: max-content;
  text-align: right;

  > h3 {
    font-size: 18px;
    font-weight: 600;
  }
  > p {
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.primaryColor};
  }
`

export const FarmCardRewardsSection = styled.div<{ theme: MavrykTheme }>`\
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  font-size: 14px;
  color: ${({ theme }) => theme.subTextColor};
  
  > h4 {
    font-weight: 600;
  }
  > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    > p {
      
    }
    button {
      width: 50%;
      max-height: 40px;
    }
  }
`
export const FarmCardStakedBalanceSection = styled.div<{ theme: MavrykTheme }>`
  margin: 5px 0;
  width: 100%;
  color: ${({ theme }) => theme.subTextColor};
  > h4 {
    font-weight: 600;
    padding-bottom: 10px;
  }

  > div {
    display: flex;
    flex-direction: row;
  }
  #connectWalletButton {
    width: 100%;
  }
`

export const FarmCardDropDownContainer = styled.div<{ height: number; theme: MavrykTheme }>`
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

export const StakedBalanceAddSubtractButton = styled.button<{ theme: MavrykTheme }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin: 5px;
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.primaryColor};
`

export const StakedBalanceAddSubtractIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;
`
