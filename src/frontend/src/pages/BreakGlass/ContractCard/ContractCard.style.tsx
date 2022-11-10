import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

import { headerColor, cyanColor, royalPurpleColor, skyColor } from '../../../styles/colors'

export const ContractCardWrapper = styled.div<{ theme: MavrykTheme }>`
  width: 48%;
  min-height: 135px;
  height: fit-content;
  border: 1px solid ${royalPurpleColor};
  border-radius: 10px;
  display: flex;
  flex-direction: column;

  &:hover,
  &.active {
    border: 1px solid ${cyanColor};
    box-shadow: 0px 4px 4px rgba(134, 212, 201, 0.5);
  }
`

export const ContractCardTopSection = styled.div<{ theme: MavrykTheme }>`
  padding: 22px 20px 18px 20px;
  background-color: ${({ theme }) => theme.containerColor};
  display: flex;
  border-radius: 10px;
  flex-direction: column;
  row-gap: 13px;

  .hidden {
    visibility: hidden;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .card-title {
    font-weight: 600;
    font-size: 24px;
    line-height: 24px;
    width: 180px;
    height: 60px;
    color: ${headerColor};
    padding-right: 10px;
    text-transform: capitalize;
  }

  .card-info-item {
    margin-top: 5px;
    justify-content: space-between;
    display: flex;
    color: ${skyColor};
    column-gap: 15px;
    font-weight: 600;

    > div {
      color: ${cyanColor};
    }

    svg {
      stroke: rgb(134, 212, 201);
    }
  }
`
