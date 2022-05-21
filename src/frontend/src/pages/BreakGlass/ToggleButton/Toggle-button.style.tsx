import styled from 'styled-components/macro';
import { MavrykTheme } from '../../../styles/interfaces';

export const ToggleButtonWrapper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  border: 1px solid #503eaa;
  border-radius: 20px;
  font-size: 16px;
  color: #8d86eb;
  max-height: 35px;
`;

export const ToggleButtonItem = styled.div<{ theme: MavrykTheme }>`
  padding: 0 15px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.4s all ease-in-out;
  font-weight: 600;
  cursor: pointer;

  &.selected {
    background: #8d86eb;
    border-radius: 17.5px;
    color: #080628;
    transition: 0.4s all ease-in-out;
  }
`;
