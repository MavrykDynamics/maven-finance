import styled from 'styled-components/macro'

import { Card, headerColor } from '../../styles'
import { MavrykTheme } from '../../styles/interfaces'

export const ProposalSubmissionStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  height: 100%;
`

export const SubmissionStyled = styled.section<{ theme: MavrykTheme }>`
  min-height: 477px;
  display: flex;
  flex-direction: column;
`

export const ProposalSubmissionForm = styled(Card)`
  padding-bottom: 30px;
  position: relative;
  margin-top: 20px;
  padding-top: 28px;

  h1 {
    margin-top: 0;
    margin-bottom: 4px;
  }

  p {
    margin-top: 30px;
  }

  label {
    color: ${headerColor};
    padding-bottom: 9px;
    display: block;
    padding-left: 5px;
  }

  .description-textarea {
    margin-bottom: 19px;
  }

  .document-uploader-wrap {
    padding-top: 18px;
  }

  .step-2-textarea {
    textarea {
      height: 189px;
    }
  }
`

export const FormHeaderGroup = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  margin-bottom: 26px;

  h1 {
    margin: 0;
    margin-right: auto;
  }
`

export const FormTitleAndFeeContainer = styled.div<{ theme: MavrykTheme }>`
  align-items: flex-start;
  margin-bottom: 27px;
  display: grid;
  grid-template-columns: 1fr 1fr 170px;
  column-gap: 30px;
`
export const FormTitleContainer = styled.div<{ theme: MavrykTheme }>``

export const FormSubTitle = styled.p<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  font-weight: 700;
`
export const FormTitleEntry = styled.div<{ theme: MavrykTheme }>`
  font-weight: 700;
  font-size: 14px;
  line-height: 14px;
  padding-left: 5px;
  color: ${({ theme }) => theme.valueColor};
  padding-top: 10px;
`
export const UploaderFileSelector = styled.div<{ theme: MavrykTheme }>`
  margin: 15px 0;
  cursor: pointer;
  min-height: 100px;
  width: 100%;
  border: 2px dashed ${({ theme }) => theme.borderColor};
  display: inline-block;
  border-radius: 10px;

  > div {
    width: 100%;
    height: 100%;
    position: relative;
  }
  > div > input {
    all: unset;
    display: inline-block;
    border-radius: 10px;
    outline: none;
    width: 100%;
    height: 100%;
    appearance: initial;
    opacity: 0;
    position: relative;
    -webkit-appearance: none;
  }
`

export const UploadIconContainer = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  top: 15%;
  left: 47.5%;
  text-align: center;

  > div {
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.textColor};
  }
`
export const UploadIcon = styled.svg<{ theme: MavrykTheme }>`
  stroke: ${({ theme }) => theme.primaryColor};
  width: 37px;
  height: 37px;

  > use {
    overflow: visible;
  }
  &.primary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.textColor};
  }
`
export const ProposalSubmissionInvoiceImage = styled.div`
  margin: 30px 0 15px;
  min-height: 200px;
  > img {
    height: 100%;
  }
`
export const FormTableGrid = styled.div`
  padding-top: 10px;
  margin-bottom: auto;
`

export const FormButtonContainer = styled.div<{ theme: MavrykTheme }>`
  margin-top: 45px;
  padding-bottom: 24px;
  display: flex;
  justify-content: flex-end;

  > button {
    max-width: 250px;
    margin-left: 10px;

    &.bytes,
    &.financial {
      svg {
        fill: ${({ theme }) => theme.backgroundColor};
        stroke: transparent;
      }
    }

    &.lock {
      svg {
        fill: ${({ theme }) => theme.valueColor};
        stroke: transparent;
      }
    }
  }
`
