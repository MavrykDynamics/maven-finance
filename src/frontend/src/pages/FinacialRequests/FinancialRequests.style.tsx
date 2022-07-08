import styled from 'styled-components/macro'
import { Card, cyanColor, skyColor, royalPurpleColor, headerColor } from 'styles'

import { MavrykTheme } from '../../styles/interfaces'

export const FinancialRequestsStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
`

export const FinancialRequestsRightContainer = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  width: calc(50% - 30px);
  padding: 28px 30px;
  border-radius: 10px;
  height: min-content;
  margin-top: 0;
  flex-shrink: 0;
  margin-left: 30px;
  position: relative;
  padding-bottom: 86px;

  &::after {
    position: absolute;
    content: '';
    width: 44px;
    height: 3px;
    border-radius: 10px;
    bottom: 42px;
    left: 50%;
    background-color: ${royalPurpleColor};
    transform: translateX(-50%);
  }

  .voting_ending {
    margin-top: 15px;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${cyanColor};
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    margin-top: 16px;
  }

  .info_section_wrapper {
    display: flex;
    column-gap: 50px;
  }

  .info_section {
    display: flex;
    flex-direction: column;
    margin-top: 25px;

    .list {
      display: flex;
      flex-direction: column;
      row-gap: 6px;
      margin-top: 6px;
      width: 100%;

      .list_item {
        display: flex;
        width: 100%;
        justify-content: space-between;
        p {
          margin: 0;
        }
      }
    }
  }
`

export const InfoBlockTitle = styled.div<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
  color: ${headerColor};
`

export const InfoBlockDescr = styled.div<{ theme: MavrykTheme }>`
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: ${skyColor};
  margin-top: 5px;
`

export const InfoBlockListValue = styled.div<{ fontColor: string; theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 12px;
  line-height: 12px;
  color: ${({ fontColor }) => fontColor};
`

export const FinancialRequestsContainer = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  padding-top: 28px;
`
