import styled from 'styled-components/macro';
import { MavrykTheme } from '../../../styles/interfaces';

export const AccordeonWrapper = styled.div<{ theme: MavrykTheme }>``;

export const AccordeonToggler = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 14px;
  padding-bottom: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  color: #6a6a9b;

  .accordeon-icon {
    width: 16px;
    height: 12px;
    fill: #6a6a9b;
    margin-left: 7px;
  }
`;

export const AccordeonContent = styled.div<{ theme: MavrykTheme }>`
  display: none;
  overflow: hidden;
  padding-left: 26px;
  padding-bottom: 16px;
  row-gap: 8px;
  flex-direction: column;
  &.expaned {
    display: flex;
    height: fit-content;
  }
`;

export const AccordeonItem = styled.div<{ status: boolean; theme: MavrykTheme }>`
  font-weight: 400;
  font-size: 18px;
  color: ${({ status, theme }) => (status ? theme.upColor : theme.downColor)};
`;
