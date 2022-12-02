import styled from 'styled-components/macro'
import { headerColor, darkColor, royalPurpleColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const ToggleStyle = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;

  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .sufix {
    margin-left: 14px;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
  }

  .react-toggle-track {
    box-shadow: 0px 0px 1px 2px ${royalPurpleColor};
  }

  .react-toggle--focus .react-toggle-thumb {
    box-shadow: none;
  }

  .react-toggle:not(.react-toggle--checked) .react-toggle-track,
  .react-toggle:hover:not(.react-toggle--disabled) .react-toggle-track {
    background-color: ${darkColor};
  }

  .react-toggle--checked .react-toggle-track,
  .react-toggle--checked:hover:not(.react-toggle--disabled) .react-toggle-track {
    background-color: ${royalPurpleColor};
  }

  .react-toggle-thumb {
    background-color: ${headerColor};
    border-color: ${darkColor};
  }
`
