import styled from 'styled-components/macro'

import { Card, headerColor, downColor, cyanColor, boxShadowColor } from '../../styles'
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

    span {
      text-transform: lowercase;
    }
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

  .step-bytes-title {
    margin-bottom: 19px;
    width: 517px;
  }

  .source-code-input-wrap {
    width: 517px;
  }

  .step-bytes {
    position: relative;
    padding-bottom: 15px;

    article {
      margin-top: 27px;
      display: flex;
      flex-direction: column;
      background: ${({ theme }) => theme.backgroundColor};
      border-radius: 10px;
      padding: 22px 50px 20px 40px;
      position: relative;
      border: 1px solid transparent;

      .idx {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: 600;
        font-size: 14px;
        line-height: 14px;
        color: ${({ theme }) => theme.headerColor};
      }

      &:hover {
        border-color: ${cyanColor};
        box-shadow: 0px 4px 4px ${boxShadowColor};
      }

      .remove-byte {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);

        svg {
          margin-top: 6px;
          width: 20px;
          height: 20px;
          fill: ${({ theme }) => theme.headerColor};
          transition: 0.3s all;
        }
        &:hover {
          svg {
            fill: ${cyanColor};
          }
        }

        &.disabled {
          pointer-events: none;
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      &.draggabe {
        cursor: grab;
      }

      &.underDrop {
        border-color: ${cyanColor};
        box-shadow: 0px 4px 4px ${boxShadowColor};
      }
    }

    .delete-pair {
      width: auto;
      align-self: flex-end;
      padding: 0 40px;
      margin-top: 20px;
    }
  }

  .step-plus-bytes {
    position: absolute;
    color: ${headerColor};
    font-size: 24px;
    right: 0;
    bottom: -26px;

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }
  }

  .desr-block {
    margin-bottom: 30px;
  }
`

export const FormHeaderGroup = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  margin-bottom: 26px;

  h1 {
    margin: 0;
    margin-right: auto;

    .label {
      color: ${downColor};
      font-weight: normal;
      font-size: 16px;
      padding-left: 16px;
    }
  }
`

export const FormTitleAndFeeContainer = styled.div<{ theme: MavrykTheme }>`
  align-items: flex-start;
  margin-bottom: 27px;
  display: grid;
  grid-template-columns: 517px 1fr 170px;
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

  &.disabled {
    pointer-events: none;
  }

  .input-cell {
    padding: 0;

    .submit-proposal-stage-3 {
      > div {
        > div.success {
          display: none;
        }

        input {
          width: 96%;
          margin: 0 auto;
          border: none;
          background-color: transparent;
          box-shadow: unset;
          color: ${cyanColor};

          &:hover {
            background-color: transparent;
          }

          &:focus {
            border: none;
            box-shadow: unset;
          }

          &.error {
            width: 85%;
            border: none;
            box-shadow: unset;

            &:focus {
              box-shadow: unset;
            }
          }

          &.success {
            border: none;
            box-shadow: unset;
            color: ${cyanColor};

            &:focus {
              box-shadow: unset;
            }
          }
        }
      }
    }
  }
`

export const FormButtonContainer = styled.div<{ theme: MavrykTheme }>`
  margin-top: 50px;
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
