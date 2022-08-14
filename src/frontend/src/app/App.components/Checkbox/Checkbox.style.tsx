import styled from 'styled-components/macro'

import { containerColor, royalPurpleColor, headerColor, darkColor } from 'styles'

export const CheckboxStyled = styled.div`
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
` // CheckboxStyled
