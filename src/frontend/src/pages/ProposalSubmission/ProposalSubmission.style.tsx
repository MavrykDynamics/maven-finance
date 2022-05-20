import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { Card, headerColor } from '../../styles'

export const ProposalSubmissionStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  height: 100%;
`

export const ProposalSubmissionForm = styled(Card)`
  padding-bottom: 80px;
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
`

export const FormHeaderGroup = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  margin-bottom: 26px;

  h1 {
    margin: 0;
    margin-right: auto;
  }

  .info-link {
    position: absolute;
    right: 0;
    top: 0;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
      width: 16px;
      height: 16px;
      fill: ${({ theme }) => theme.headerColor};

      &:hover {
        fill: ${({ theme }) => theme.valueColor};
      }
    }
  }
`

export const FormTitleAndFeeContainer = styled.div<{ theme: MavrykTheme }>`
  align-items: center;
  margin-bottom: 19px;
  display: grid;
  grid-template-columns: auto 325px;
  column-gap: 30px;
`
export const FormTitleContainer = styled.div<{ theme: MavrykTheme }>``

export const FormSubTitle = styled.p<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  font-weight: 700;
`
export const FormTitleEntry = styled.div<{ theme: MavrykTheme }>`
  display: inline-flex;
  align-items: center;
  height: 50px;
  padding: 12px 16px;
  color: ${({ theme }) => theme.primaryColor};
  font-size: 16px;
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

export const FormButtonContainer = styled.div<{ theme: MavrykTheme }>`
  margin-top: 45px;
  padding-bottom: 24px;

  > button {
    max-width: 250px;
    float: right;
    margin: 0 10px;
  }
`
