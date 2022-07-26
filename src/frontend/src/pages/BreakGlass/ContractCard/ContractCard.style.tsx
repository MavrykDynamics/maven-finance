import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

import { headerColor, cyanColor, royalPurpleColor } from '../../../styles/colors'

export const ContractCardWrapper = styled.div<{ theme: MavrykTheme }>`
  width: 31%;
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
  padding: 22px 16px 18px 30px;
  background-color: ${({ theme }) => theme.containerColor};
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 28px 16px;
  border-radius: 10px;
  row-gap: 13px;

  .card-title {
    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 1;
    grid-column-end: 2;
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 24px;
    line-height: 24px;
    color: ${headerColor};
    width: 180px;
    padding-right: 10px;
    text-transform: capitalize;

    .truncate-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .card-flag-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 2;
    grid-column-end: 3;
  }

  .card-hash-wrapper {
    grid-row-start: 2;
    grid-row-end: 3;
    grid-column-start: 1;
    grid-column-end: 3;
    color: ${cyanColor};
    margin-top: 5px;

    svg {
      stroke: rgb(134, 212, 201);
    }
  }
`
