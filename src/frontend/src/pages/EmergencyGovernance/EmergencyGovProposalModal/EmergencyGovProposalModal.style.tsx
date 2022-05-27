import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, headerColor } from 'styles'

export const EmergencyGovProposalModalContent = styled.div`
  padding: 0;

  > h1 {
    margin-top: -2px;
    margin-bottom: 27px;
  }

  label {
    color: ${headerColor};
    padding-bottom: 9px;
    display: block;
    padding-left: 5px;
  }

  .upload-wrap {
    padding-top: 6px;

    label {
      margin-bottom: 0;
    }
  }
`

export const EmergencyGovProposalModalButtons = styled.div`
  display: grid;
  grid-template-columns: 250px 250px;
  grid-gap: 10px;
  justify-content: flex-end;
  padding-top: 40px;
  padding-bottom: 30px;
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

  > #ipfsUploaderContainer {
    margin-top: 5px;
  }

  > #textAreaContainer {
    margin-bottom: 5px;
  }
`
