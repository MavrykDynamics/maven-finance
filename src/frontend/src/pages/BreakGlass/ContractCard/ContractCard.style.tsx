import styled from 'styled-components/macro';
import { MavrykTheme } from '../../../styles/interfaces';

export const ContractCardWrapper = styled.div<{ theme: MavrykTheme }>`
  width: 31%;
  min-height: 135px;
  height: fit-content;
  border: 1px solid #503eaa;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
`;

export const ContractCardTopSection = styled.div<{ theme: MavrykTheme }>`
  padding: 22px 16px 18px 16px;
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
    color: #8d86eb;
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
    color: #86d4c9;
  }
`;
