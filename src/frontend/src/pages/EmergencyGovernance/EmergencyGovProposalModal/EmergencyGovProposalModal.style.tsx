import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const EmergencyGovProposalModalContent = styled.div`
  padding: 0 20px 20px 20px;

  > h1 {
    margin: 20px auto 10px 0;
    color: ${({ theme }) => theme.textColor};
    font-weight: 700;
    font-size: 25px;
  }
`

export const EmergencyGovProposalModalButtons = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
`

export const EmergencyGovProposalModalGrid = styled.div<{ theme: MavrykTheme }>`
  font-weight: 500;
  margin: auto;
  text-align: center;

  > div {
    color: ${({ theme }) => theme.subTextColor};
  }

  > p {
    color: ${({ theme }) => theme.primaryColor};
    margin-top: 0;
  }
`

export const ModalFormContentContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

  > div > textarea {
    min-width: 40vw;
  }

  > #ipfsUploaderContainer {
    margin-top: 5px;
  }

  > #textAreaContainer {
    margin-bottom: 5px;
  }
`
