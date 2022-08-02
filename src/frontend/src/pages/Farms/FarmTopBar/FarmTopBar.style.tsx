import { MavrykTheme } from '../../../styles/interfaces'
import styled from 'styled-components/macro'
import { Card, headerColor, cyanColor } from 'styles'

export const FarmTopBarStyled = styled(Card)`
  margin-bottom: 20px;
  display: flex;

  .change-view {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    margin-left: 20px;

    svg {
      width: 20px;
      height: 20px;
      fill: ${headerColor};
    }

    .btn-vertical {
      transform: rotate(90deg);
    }
  }

  &.vertical .change-view .btn-vertical svg,
  &.horizontal .change-view .btn-horizontal svg {
    fill: ${cyanColor};
  }
`

export const StakedToggleContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  > label {
    margin-right: 15px;
    > {
      .farm-toggle.react-toggle--checked .react-toggle-track {
        background-color: ${({ theme }) => theme.connectWalletBackgroundColor};
      }
      .farm-toggle.react-toggle:not(.react-toggle--checked) .react-toggle-thumb {
        background-color: ${({ theme }) => theme.connectWalletBackgroundColor};
        border-color: ${({ theme }) => theme.connectWalletBackgroundColor};
      }
      .farm-toggle.react-toggle:not(.react-toggle--checked) .react-toggle-track {
        background-color: ${({ theme }) => theme.primaryColor};
      }
      .farm-toggle.react-toggle--checked .react-toggle-thumb {
        background-color: ${({ theme }) => theme.primaryColor};
        border-color: ${({ theme }) => theme.connectWalletBackgroundColor};
      }
    }
  }
`
