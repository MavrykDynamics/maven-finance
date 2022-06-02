import styled from 'styled-components/macro';
import { MavrykTheme } from '../../../styles/interfaces';

import { royalPurpleColor, headerColor } from '../../../styles/colors';

export const ToggleButtonWrapper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  border: 1px solid ${royalPurpleColor};
  border-radius: 20px;
  font-size: 16px;
  color: ${headerColor};
  max-height: 35px;
  max-width: 65.5%;

  &.small-size {
    max-width: 31%;
    .toggle-btn {
      max-width: 50%;
      padding: 0 10px;
    }
  }
`;

export const ToggleButtonItem = styled.div<{ theme: MavrykTheme }>`
  padding: 0 18px;
  height: 100%;
  max-width: 178px;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.4s all ease-in-out;
  font-weight: 600;
  cursor: pointer;

  &.selected {
    background: ${headerColor};
    border-radius: 17.5px;
    color: #080628;
    transition: 0.4s all ease-in-out;
  }
`;
