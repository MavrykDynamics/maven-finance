import styled, { keyframes } from 'styled-components/macro'

import { MavrykTheme } from '../../../styles/interfaces'

export const IPFSUploaderStyled = styled.div<{ theme: MavrykTheme }>`
  margin-bottom: 5px;
  margin-top: 23px;

  label {
    margin-bottom: 10px;
  }

  > p {
    font-weight: 700;
    color: ${({ theme }) => theme.textColor};
  }
`

export const UploaderFileSelector = styled.div<{ theme: MavrykTheme }>`
  cursor: pointer;
  height: 85px;
  width: 100%;
  border: 2px dashed ${({ theme }) => theme.headerColor};
  background-color: ${({ theme }) => theme.containerColor};
  display: flex;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  position: relative;

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

  .loading-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
  }

  .uploaded-image {
    position: relative;
    object-fit: cover;
  }
`

export const UploadIconContainer = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 50px;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;

  > div {
    font-size: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.headerColor};
    white-space: nowrap;
  }

  .upload-icon {
    stroke: ${({ theme }) => theme.headerColor};
    width: 37px;
    height: 37px;
  }

  .pencil-wrap {
    width: 16px;
    height: 16px;
    background-color: ${({ theme }) => theme.headerColor};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: absolute;
    right: 0;
    bottom: 0px;

    svg {
      width: 10px;
      height: 10px;
      stroke: ${({ theme }) => theme.containerColor};
    }
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

export const IpfsUploadedImageContainer = styled.figure`
  margin: 0;
  position: relative;
  width: 50px;
  height: 50px;

  > img {
    height: 50px;
    width: 50px;
    border-radius: 50%;
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
