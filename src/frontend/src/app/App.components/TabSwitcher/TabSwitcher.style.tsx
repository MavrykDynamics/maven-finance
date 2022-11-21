import styled, { css } from "styled-components";
import { MavrykTheme } from "styles/interfaces";

export const TabSwitcherStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;

  &.disabled {
    opacity: 0.7;
    cursor: not-allowed;

    > button {
      cursor: not-allowed;
    }
  }
`

export const ButtonStyled = styled.button<{  buttonActive: boolean; disabled: boolean; theme: MavrykTheme }>`
  position: relative;
  padding-bottom: 6px;

  font-weight: 600;
  font-size: 16px;
  line-height: 22px;

  color: ${({ theme }) => theme.navTitleColor};
  cursor: pointer;

  ${({ disabled }) =>
    disabled && css`
      opacity: 0.7;
      cursor: not-allowed;
    `}

  ${({ buttonActive }) => buttonActive && css`
    color: ${({ theme }) => theme.topBarLinkColorActive};

    &::after {
      position: absolute;
      left: calc(50% - 15px);
      bottom: 0;

      width: 30px;
      height: 1px;

      content: '';
      background-color: ${({ theme }) => theme.topBarLinkColorActive};
    }
  `}
`