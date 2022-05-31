import { MavrykTheme } from '../../../styles/interfaces'
import styled from 'styled-components/macro'

export const FarmTopBarStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  margin: 15px auto;
  display: flex;
  width: 100%;
  flex-direction: row;
  border-radius: 10px;
  padding: 10px;
  align-items: center;
  justify-content: space-evenly;

  > div {
    max-width: 35%;
  }
  #inputStyled {
    height: 50px;
    margin: 0;
    #inputComponent {
      height: 50px;
      margin: 0;
    }
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
