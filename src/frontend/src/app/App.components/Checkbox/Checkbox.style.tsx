import styled from 'styled-components/macro'

import { containerColor, royalPurpleColor, darkColor } from 'styles'

export const CheckboxStyled = styled.div`
  position: relative;
  display: flex;
  column-gap: 10px;
  align-items: center;

  .children {
    color: ${({ theme }) => theme.textColor};
    font-weight: 600;
    font-size: 14px;
  }

  label {
    width: 24px;
    height: 24px;
    border: 1px solid ${royalPurpleColor};
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.15s ease-in-out;
    cursor: pointer;
    background-color: ${darkColor};

    &:hover {
      background-color: ${containerColor};
    }
  }

  svg {
    fill: ${darkColor};
    width: 13px;
    height: 13px;
    opacity: 0;
    transition: 0.15s ease-in-out;
  }

  input {
    appearance: none;
    visibility: hidden;
    position: absolute;
    z-index: -1;

    &:checked {
      & + label {
        background-color: ${royalPurpleColor};
        svg {
          opacity: 1;
        }

        &:hover {
          background-color: ${royalPurpleColor};
        }
      }
    }
  }
`
