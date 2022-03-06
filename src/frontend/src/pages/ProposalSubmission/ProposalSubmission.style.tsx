import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { Card } from '../../styles'

export const ProposalSubmissionStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  height: 100%;
`

export const ProposalSubmissionForm = styled(Card)`
  padding-bottom: 80px;

  > h1 {
    margin-top: 0;
    font-size: 25px;
    font-weight: bold;
    color: ${({ theme }) => theme.textColor};
  }
  > p {
    margin-top: 30px;
  }
`

export const FormTitleAndFeeContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  align-items: center;
`
export const FormTitleContainer = styled.div<{ theme: MavrykTheme }>`
  margin-right: 20%;
`

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
    stroke: ${({ theme }) => theme.backgroundColor};
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
  margin: 50px 15px 0 0;

  > button {
    max-width: 300px;
    float: right;
    margin: 0 10px;
  }
`
