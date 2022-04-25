import styled, { keyframes } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const IPFSUploaderStyled = styled.div<{ theme: MavrykTheme }>`
  margin-bottom: 5px;
  margin-top: 30px;
  > p {
    font-weight: 700;
    color: ${({ theme }) => theme.textColor};
  }
`

export const UploaderFileSelector = styled.div<{ theme: MavrykTheme }>`
  margin: 15px 0;
  cursor: pointer;
  height: 100px;
  width: 100%;
  border: 2px dashed ${({ theme }) => theme.borderColor};
  background-color: ${({ theme }) => theme.backgroundColor};
  display: inline-block;
  border-radius: 10px;

  > div {
    width: 100%;
    height: 100%;
    position: relative;

    > input {
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
    color: ${({ theme }) => theme.primaryColor};
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
const zoomIn = keyframes`
  from {
    transform:scale(.2);
    opacity:0
  }
  to {
    transform:scale(1);
    opacity:1
  }
`

export const IPFSUploaderStatus = styled.div`
  display: block;
  position: absolute;
  top: 25px;
  right: 10px;
  z-index: 1;
  margin-top: -10px;
  line-height: 13px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  will-change: transform, opacity;

  &.error {
    background-image: url('/icons/input-error.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 15px;
    width: 15px;
  }

  &.success {
    background-image: url('/icons/input-success.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 12px;
    width: 17px;
  }
`

export const IpfsUploadedImageContainer = styled.div`
  margin: 30px 0 15px;
  min-height: 200px;
  > img {
    height: 100%;
  }
`

export const TextAreaIcon = styled.svg<{ theme: MavrykTheme }>`
  display: block;
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 1;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  stroke: ${({ theme }) => theme.backgroundTextColor};
`

const slideDown = keyframes`
  from {
    transform: translate3d(0, -10px, 0);
    opacity:0
  }
  to {
    transform: translate3d(0, 0px, 0);
    opacity:1
  }
`

export const IPFSUploaderErrorMessage = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.downColor};
  line-height: 24px;
  will-change: transform, opacity;
  animation: ${slideDown} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:first-letter {
    text-transform: uppercase;
  }
`
